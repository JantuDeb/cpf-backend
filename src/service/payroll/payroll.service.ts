
import { db } from "@/db/database";

import { Transaction } from "kysely";
import { DB, Employee } from "@/db/types";
import { IEmployee, IPayrollPeriod, IPayrollProcessRequest } from "@/validations/validation";
import { CpfRatesService } from "../cpf/cpf-rates.services";


export class PayrollService {
  private cpfRatesService: CpfRatesService;

  constructor() {
    this.cpfRatesService = CpfRatesService.getInstance();
  }

  private async createPayrollPeriod(
    trx: Transaction<DB>,
    organizationId: string,
    year: number,
    month: number,
  ): Promise<IPayrollPeriod | undefined> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    const updated_at = new Date();
    const payrollPeriod = await trx
      .insertInto("payroll_periods")
      .values({
        organization_id: organizationId,
        year_month: startDate,
        start_date: startDate,
        end_date: endDate,
        is_processed: false,
        updated_at,
      })
      .returningAll()
      .executeTakeFirst();
    return payrollPeriod;
  }

  private async getEmployeesToProcess(
    trx: Transaction<DB>,
    organizationId: string,
    employeeIds?: string[],
  ) {
    const query = trx
      .selectFrom("employees")
      .select([
        "id as employee_id",
        "date_of_birth",
        "basic_salary",
        "employment_type",
        "date_joined",
        "is_active",
      ])
      .where("organization_id", "=", organizationId)
      .where("is_active", "=", true);

    if (employeeIds?.length) {
      query.where("id", "in", employeeIds);
    }

    return await query.execute();
  }

  private calculateAdditionalWages(
    additionalWages: IPayrollProcessRequest["additional_wages"] = [],
    employeeId: string,
  ): number {
    return additionalWages
      .filter((wage) => wage.employee_id === employeeId)
      .reduce((sum, wage) => sum + wage.amount, 0);
  }

  private calculateDeductions(
    deductions: IPayrollProcessRequest["deductions"] = [],
    employeeId: string,
  ): number {
    return deductions
      .filter((deduction) => deduction.employee_id === employeeId)
      .reduce((sum, deduction) => sum + deduction.amount, 0);
  }

  private async calculateEmployeeCpf(employee: IEmployee, additionalWages: number) {
    const age = this.calculateAge(new Date(employee.date_of_birth));
    const ordinaryWages = parseFloat(employee.basic_salary);
    const cpfRates = this.cpfRatesService.getRates(age, ordinaryWages);

    const totalWages = ordinaryWages + additionalWages;
    const cappedWages = Math.min(totalWages, 6000); // CPF wage ceiling

    const employeeContribution = cappedWages * cpfRates.employeeRate;
    const employerContribution = cappedWages * cpfRates.employerRate;
    const totalContribution = employeeContribution + employerContribution;

    return {
      ordinary_wages: ordinaryWages.toFixed(2),
      additional_wages: additionalWages.toFixed(2),
      employee_contribution: employeeContribution.toFixed(2),
      employer_contribution: employerContribution.toFixed(2),
      ordinary_account: (totalContribution * cpfRates.allocationRatios.ordinary).toFixed(2),
      special_account: (totalContribution * cpfRates.allocationRatios.special).toFixed(2),
      medisave_account: (totalContribution * cpfRates.allocationRatios.medisave).toFixed(2),
    };
  }

  private calculateAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }

  private async saveCpfContribution(
    trx: Transaction<DB>,
    params: {
      employee: Employee;
      periodId: string;
      cpf: any;
      employeeAdditionalWages: number;
    },
  ): Promise<void> {
    const updated_at = new Date();
    await trx
      .insertInto("cpf_contributions")
      .values({
        employee_id: params.employee.employee_id,
        payroll_period_id: params.periodId,
        ordinary_wages: params.cpf.ordinary_wages,
        additional_wages: params.cpf.additional_wages,
        employee_contribution: params.cpf.employee_contribution,
        employer_contribution: params.cpf.employer_contribution,
        ordinary_account: params.cpf.ordinary_account,
        special_account: params.cpf.special_account,
        medisave_account: params.cpf.medisave_account,
        status: "PENDING",
        updated_at,
      })
      .execute();
  }

  private async saveAdditionalWages(
    trx: Transaction<DB>,
    params: {
      employee: IEmployee;
      additionalWages: IPayrollProcessRequest["additional_wages"];
      year: number;
      month: number;
    },
  ): Promise<void> {
    const paymentDate = new Date(params.year, params.month - 1, 1);
    const updated_at = new Date();
    const wageRecords = params.additionalWages
      ?.filter((wage) => wage.employee_id === params.employee.employee_id)
      .map((wage) => ({
        employee_id: wage.employee_id,
        payment_date: paymentDate,
        amount: wage.amount.toFixed(2),
        description: wage.description,
        remarks: wage.remarks || null,
        updated_at,
      }));

    if (wageRecords?.length) {
      await trx.insertInto("additional_wages").values(wageRecords).execute();
    }
  }

  private async finalizePayrollPeriod(trx: Transaction<DB>, periodId: string): Promise<void> {
    await trx
      .updateTable("payroll_periods")
      .set({
        is_processed: true,
        processed_at: new Date(),
      })
      .where("id", "=", periodId)
      .execute();
  }

  async validateEmployees(organizationId: string, employeeIds: string[]) {
    const returnEmployees = await db
      .selectFrom("employees")
      .select("id")
      .where("organization_id", "=", organizationId)
      .where("id", "in", employeeIds)
      .execute();

    return employeeIds.filter((id) => returnEmployees.some((employee) => employee.id !== id));
  }

  async getPayrollSummary(organizationId: string, year: number, month: number) {
    // Get the payroll period
    const period = await db
      .selectFrom("payroll_periods")
      .select(["id"])
      .where("organization_id", "=", organizationId)
      .where("year_month", "=", new Date(year, month - 1, 1))
      .executeTakeFirst();

    if (!period) {
      throw new Error("Payroll period not found");
    }

    // Get all CPF contributions for the period
    const contributions = await db
      .selectFrom("cpf_contributions")
      .select([
        "ordinary_wages",
        "additional_wages",
        "employee_contribution",
        "employer_contribution",
        "ordinary_account",
        "special_account",
        "medisave_account",
        "status",
      ])
      .where("payroll_period_id", "=", period.id)
      .execute();

    // Calculate summary statistics
    const summary = {
      totalEmployees: contributions.length,
      totalOrdinaryWages: 0,
      totalAdditionalWages: 0,
      totalEmployeeContribution: 0,
      totalEmployerContribution: 0,
      totalCPFContribution: 0,
      accountBreakdown: {
        ordinaryAccount: 0,
        specialAccount: 0,
        medisaveAccount: 0,
      },
      paymentStatus: {
        pending: 0,
        paid: 0,
        failed: 0,
      },
    };

    for (const contribution of contributions) {
      // Sum up wages and contributions
      summary.totalOrdinaryWages += parseFloat(contribution.ordinary_wages);
      summary.totalAdditionalWages += parseFloat(contribution.additional_wages);
      summary.totalEmployeeContribution += parseFloat(contribution.employee_contribution);
      summary.totalEmployerContribution += parseFloat(contribution.employer_contribution);

      // Sum up account allocations
      summary.accountBreakdown.ordinaryAccount += parseFloat(contribution.ordinary_account);
      summary.accountBreakdown.specialAccount += parseFloat(contribution.special_account);
      summary.accountBreakdown.medisaveAccount += parseFloat(contribution.medisave_account);

      // Count payment statuses
      switch (contribution.status) {
        case "PENDING":
          summary.paymentStatus.pending++;
          break;
        case "PROCESSED":
          summary.paymentStatus.paid++;
          break;
        case "FAILED":
          summary.paymentStatus.failed++;
          break;
      }
    }

    // Calculate total CPF contribution
    summary.totalCPFContribution =
      summary.totalEmployeeContribution + summary.totalEmployerContribution;

    // Format all numbers to 2 decimal places
    return {
      ...summary,
      totalOrdinaryWages: Number(summary.totalOrdinaryWages.toFixed(2)),
      totalAdditionalWages: Number(summary.totalAdditionalWages.toFixed(2)),
      totalEmployeeContribution: Number(summary.totalEmployeeContribution.toFixed(2)),
      totalEmployerContribution: Number(summary.totalEmployerContribution.toFixed(2)),
      totalCPFContribution: Number(summary.totalCPFContribution.toFixed(2)),
      accountBreakdown: {
        ordinaryAccount: Number(summary.accountBreakdown.ordinaryAccount.toFixed(2)),
        specialAccount: Number(summary.accountBreakdown.specialAccount.toFixed(2)),
        medisaveAccount: Number(summary.accountBreakdown.medisaveAccount.toFixed(2)),
      },
      period: {
        year,
        month,
        status: summary.paymentStatus.paid === contributions.length ? "COMPLETED" : "IN_PROGRESS",
      },
    };
  }

  async processPayroll(request: IPayrollProcessRequest) {
    const { organization_id, year, month, additional_wages = [], deductions = [] } = request;

    await this.cpfRatesService.fetchRates();

    return await db.transaction().execute(async (trx) => {
      const period = await this.createPayrollPeriod(trx, organization_id, year, month);
      if (!period) return;
      const employees = await this.getEmployeesToProcess(
        trx,
        organization_id,
        request.employee_ids,
      );

      for (const employee of employees) {
        await this.processEmployeePayroll(trx, employee, period.id, {
          additional_wages,
          deductions,
          year,
          month,
        });
      }

      await this.finalizePayrollPeriod(trx, period.id);
      return { success: true, periodId: period.id };
    });
  }

  private async processEmployeePayroll(
    trx: Transaction<DB>,
    employee: any,
    periodId: string,
    options: {
      additional_wages: IPayrollProcessRequest["additional_wages"];
      deductions: IPayrollProcessRequest["deductions"];
      year: number;
      month: number;
    },
  ) {
    const employeeAdditionalWages = this.calculateAdditionalWages(
      options.additional_wages,
      employee.employee_id,
    );

    const employeeDeductions = this.calculateDeductions(options.deductions, employee.employee_id);

    const cpf = await this.calculateEmployeeCpf(employee, employeeAdditionalWages);

    await this.saveCpfContribution(trx, {
      employee,
      periodId,
      cpf,
      employeeAdditionalWages,
    });

    if (employeeAdditionalWages > 0) {
      await this.saveAdditionalWages(trx, {
        employee,
        additionalWages: options.additional_wages,
        year: options.year,
        month: options.month,
      });
    }
  }
}
