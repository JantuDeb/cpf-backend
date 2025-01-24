import { db } from "@/db/database";
import { initialSeedData } from "@/seed/initial-data";
import { EmployeeBulkImport } from "@/types";
import { employeeBulkImportSchema } from "@/validations/validation";

export async function bulkImportEmployees(organizationId: string, employees: EmployeeBulkImport[]) {
  // Validate all employees first
  const validatedEmployees = employees.map((emp) => employeeBulkImportSchema.parse(emp));

  return await db.transaction().execute(async (trx) => {
    // Get department mappings
    const departments = await trx
      .selectFrom("departments")
      .select(["id", "code"])
      .where("organization_id", "=", organizationId)
      .execute();

    const deptMap = new Map(departments.map((d) => [d.code, d.id]));

    // Insert employees
    const insertedEmployees = await Promise.all(
      validatedEmployees.map(async (emp) => {
        const departmentId = deptMap.get(emp.department_code);
        if (!departmentId) {
          throw new Error(`Department ${emp.department_code} not found`);
        }

        return await trx
          .insertInto("employees")
          .values({
            id: emp.employee_id,
            organization_id: organizationId,
            department_id: departmentId,
            employee_id: emp.employee_id,
            name: emp.name,
            nric: emp.nric,
            email: emp.email,
            contact_number: emp.contact_number,
            date_of_birth: new Date(emp.date_of_birth),
            date_joined: new Date(emp.date_joined),
            employment_type: emp.employment_type,
            citizenship_status: emp.citizenship_status,
            basic_salary: emp.basic_salary.toString(),
            allowances: (emp.allowances || 0).toString(),
            bank_details: emp.bank_name
              ? {
                  bank_name: emp.bank_name,
                  account_number: emp.bank_account_number,
                }
              : null,
            updated_at: new Date(),
          })
          .returning(["id", "employee_id"])
          .executeTakeFirst();
      }),
    );

    // Initialize leave balances for all employees

    const employees = insertedEmployees.filter((em) => em !== undefined);
    await Promise.all(
      employees.map(async (emp) => {
        return await trx
          .insertInto("leave_balances")
          .values(
            initialSeedData.leaveTypes.map((lt) => ({
              employee_id: emp.id,
              leave_type: lt.code,
              year: new Date().getFullYear(),
              entitled: lt.default_days.toString(),
              taken: "0",
              remaining: lt.default_days.toString(),
            })),
          )
          .execute();
      }),
    );

    return insertedEmployees;
  });
}

// Example CSV format for employee bulk import
const exampleCsvFormat = `
employee_id,name,nric,email,contact_number,date_of_birth,date_joined,employment_type,citizenship_status,department_code,basic_salary,allowances,bank_name,bank_account_number
EMP001,John Doe,S1234567A,john@example.com,91234567,1990-01-01,2024-01-01,PERMANENT,CITIZEN,IT,5000,500,DBS,12345678
EMP002,Jane Smith,S7654321B,jane@example.com,98765432,1992-06-15,2024-01-15,PERMANENT,CITIZEN,HR,4500,300,UOB,87654321
`;

// Example usage:

import csv from "csvtojson";
import fs from "fs";

const importEmployeesFromCsv = async (organizationId: string, filePath: string) => {
  const fileContent = fs.readFileSync(filePath, "utf-8");
  const records = await csv().fromString(fileContent);

  // Transform CSV data to match EmployeeBulkImport interface
  const employees: EmployeeBulkImport[] = records.map((record) => ({
    ...record,
    basic_salary: parseFloat(record.basic_salary),
    allowances: record.allowances ? parseFloat(record.allowances) : undefined,
  }));

  return await bulkImportEmployees(organizationId, employees);
};


