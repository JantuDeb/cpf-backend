export interface CpfRate {
  employeeRate: number;
  employerRate: number;
  allocationRatios: {
    ordinary: number;
    special: number;
    medisave: number;
  };
}

export interface CpfRatesCriteria {
  minAge: number;
  maxAge: number;
  minWage?: number;
  maxWage?: number;
}
