import type { ColumnType } from "kysely";
export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

import type { OrgType, EmploymentType, CitizenshipStatus, PaymentStatus, LeaveStatus } from "./enums";

export type AdditionalWage = {
    id: Generated<string>;
    employee_id: string;
    payment_date: Timestamp;
    amount: string;
    description: string;
    remarks: string | null;
    created_at: Generated<Timestamp>;
    updated_at: Timestamp;
};
export type AuditLog = {
    id: Generated<string>;
    entity_type: string;
    entity_id: string;
    action: string;
    changes: unknown;
    performed_by: string;
    created_at: Generated<Timestamp>;
};
export type CpfContribution = {
    id: Generated<string>;
    employee_id: string;
    payroll_period_id: string;
    ordinary_wages: string;
    additional_wages: Generated<string>;
    employee_contribution: string;
    employer_contribution: string;
    ordinary_account: string;
    special_account: string;
    medisave_account: string;
    status: Generated<PaymentStatus>;
    paid_at: Timestamp | null;
    payment_reference: string | null;
    created_at: Generated<Timestamp>;
    updated_at: Timestamp;
};
export type department = {
    id: Generated<string>;
    organization_id: string;
    name: string;
    code: string;
    parent_dept_id: string | null;
    created_at: Generated<Timestamp>;
    updated_at: Timestamp;
    deleted_at: Timestamp | null;
};
export type Employee = {
    id: Generated<string>;
    organization_id: string;
    department_id: string | null;
    employee_id: string;
    name: string;
    email: string | null;
    contact_number: string | null;
    nric: string;
    date_of_birth: Timestamp;
    date_joined: Timestamp;
    employment_type: EmploymentType;
    citizenship_status: CitizenshipStatus;
    is_active: Generated<boolean>;
    emergency_contact: unknown | null;
    bank_details: unknown | null;
    documents: unknown | null;
    basic_salary: string;
    allowances: Generated<string>;
    created_at: Generated<Timestamp>;
    updated_at: Timestamp;
    deleted_at: Timestamp | null;
};
export type LeaveBalance = {
    id: Generated<string>;
    employee_id: string;
    leave_type: string;
    year: number;
    entitled: string;
    taken: string;
    remaining: string;
};
export type LeaveRequest = {
    id: Generated<string>;
    employee_id: string;
    leave_type: string;
    start_date: Timestamp;
    end_date: Timestamp;
    status: Generated<LeaveStatus>;
    remarks: string | null;
    created_at: Generated<Timestamp>;
    updated_at: Timestamp;
};
export type Organization = {
    id: Generated<string>;
    parent_id: string | null;
    name: string;
    type: OrgType;
    uen: string | null;
    registration_date: Timestamp | null;
    cpf_submission_num: string | null;
    created_at: Generated<Timestamp>;
    updated_at: Timestamp;
    deleted_at: Timestamp | null;
};
export type PayrollPeriod = {
    id: Generated<string>;
    organization_id: string;
    year_month: Timestamp;
    start_date: Timestamp;
    end_date: Timestamp;
    is_processed: Generated<boolean>;
    processed_at: Timestamp | null;
    created_at: Generated<Timestamp>;
    updated_at: Timestamp;
};
export type SalaryHistory = {
    id: Generated<string>;
    employee_id: string;
    effective_date: Timestamp;
    basic_salary: string;
    allowances: string;
    reason: string | null;
    remarks: string | null;
    created_at: Generated<Timestamp>;
    updated_at: Timestamp;
};
export type DB = {
    additional_wages: AdditionalWage;
    audit_logs: AuditLog;
    cpf_contributions: CpfContribution;
    departments: department;
    employees: Employee;
    leave_balances: LeaveBalance;
    leave_requests: LeaveRequest;
    organizations: Organization;
    payroll_periods: PayrollPeriod;
    salary_histories: SalaryHistory;
};
