export interface EmployeeBulkImport {
  employee_id: string; // Company's internal ID
  name: string;
  nric: string;
  email?: string;
  contact_number?: string;
  date_of_birth: string; // YYYY-MM-DD
  date_joined: string; // YYYY-MM-DD
  employment_type: 'PERMANENT' | 'CONTRACT' | 'TEMPORARY' | 'PART_TIME';
  citizenship_status: 'CITIZEN' | 'PR_FIRST_YEAR' | 'PR_SECOND_YEAR' | 'PR_THIRD_YEAR_ONWARDS' | 'FOREIGNER';
  department_code: string;
  basic_salary: number;
  allowances?: number;
  bank_name?: string;
  bank_account_number?: string;
}

export interface PayrollBulkProcess {
  year: number;
  month: number; // 1-12
  additional_wages: Array<{
    employee_id: string;
    amount: number;
    description: string;
  }>;
  deductions?: Array<{
    employee_id: string;
    amount: number;
    description: string;
  }>;
}
