export const OrgType = {
    GROUP: "GROUP",
    DIVISION: "DIVISION",
    LEGAL_ENTITY: "LEGAL_ENTITY",
    BRANCH: "BRANCH",
    COST_CENTER: "COST_CENTER"
} as const;
export type OrgType = (typeof OrgType)[keyof typeof OrgType];
export const EmploymentType = {
    PERMANENT: "PERMANENT",
    CONTRACT: "CONTRACT",
    TEMPORARY: "TEMPORARY",
    PART_TIME: "PART_TIME"
} as const;
export type EmploymentType = (typeof EmploymentType)[keyof typeof EmploymentType];
export const CitizenshipStatus = {
    CITIZEN: "CITIZEN",
    PR_FIRST_YEAR: "PR_FIRST_YEAR",
    PR_SECOND_YEAR: "PR_SECOND_YEAR",
    PR_THIRD_YEAR_ONWARDS: "PR_THIRD_YEAR_ONWARDS",
    FOREIGNER: "FOREIGNER"
} as const;
export type CitizenshipStatus = (typeof CitizenshipStatus)[keyof typeof CitizenshipStatus];
export const PaymentStatus = {
    PENDING: "PENDING",
    PROCESSED: "PROCESSED",
    FAILED: "FAILED",
    CANCELLED: "CANCELLED"
} as const;
export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];
export const LeaveStatus = {
    PENDING: "PENDING",
    APPROVED: "APPROVED",
    REJECTED: "REJECTED",
    CANCELLED: "CANCELLED"
} as const;
export type LeaveStatus = (typeof LeaveStatus)[keyof typeof LeaveStatus];
