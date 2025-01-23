import { z } from "zod";

export const employeeBulkImportSchema = z.object({
  employee_id: z.string().min(1),
  name: z.string().min(1),
  nric: z.string().regex(/^[STFG]\d{7}[A-Z]$/),
  email: z.string().email().optional(),
  contact_number: z.string().optional(),
  date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  date_joined: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  employment_type: z.enum(["PERMANENT", "CONTRACT", "TEMPORARY", "PART_TIME"]),
  citizenship_status: z.enum(["CITIZEN", "PR_FIRST_YEAR", "PR_SECOND_YEAR", "PR_THIRD_YEAR_ONWARDS", "FOREIGNER"]),
  department_code: z.string().min(1),
  basic_salary: z.number().positive(),
  allowances: z.number().min(0).optional(),
  bank_name: z.string().optional(),
  bank_account_number: z.string().optional(),
});

// Define the OrgType enum in Zod
export const OrgTypeSchema = z.enum(["GROUP", "DIVISION", "LEGAL_ENTITY", "BRANCH", "COST_CENTER"]);

export type IOrgType = z.infer<typeof OrgTypeSchema>;

// Define the Organization Zod schema
export const organizationSchema = z.object({
  id: z.string().optional(), // Assuming the Generated<string> type resolves to string
  parent_id: z.string().optional(), // nullable for `string | null`
  name: z.string(),
  type: OrgTypeSchema, // Use the OrgType schema
  uen: z.string().optional(),
  registration_date: z.string().datetime().optional(),
  cpf_submission_num: z.string().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.coerce.date(),
  deleted_at: z.string().datetime().optional(),
});

// Infer the TypeScript type for validation
export type IOrganization = z.infer<typeof organizationSchema>;

export const employeeSchema = z.object({
  organization_id: z.string().uuid(),
  department_id: z.string().uuid().nullable(),
  employee_id: z.string(),
  name: z.string(),
  email: z.string().email().nullable(),
  contact_number: z.string().nullable(),
  nric: z.string(),
  date_of_birth: z.string().datetime(),
  date_joined: z.string().datetime(),
  employment_type: z.enum(["PERMANENT", "CONTRACT", "TEMPORARY", "PART_TIME"]),
  citizenship_status: z.enum(["CITIZEN", "PR_FIRST_YEAR", "PR_SECOND_YEAR", "PR_THIRD_YEAR_ONWARDS", "FOREIGNER"]),
  emergency_contact: z.unknown().nullable(),
  bank_details: z.unknown().nullable(),
  documents: z.unknown().nullable(),
  basic_salary: z.string(),
  allowances: z.string(),
  updated_at: z.coerce.date(),
  deleted_at: z.string().datetime().optional(),
});

export type IEmployee = z.infer<typeof employeeSchema>;
