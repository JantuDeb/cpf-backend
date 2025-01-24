import { CpfRate, CpfRatesCriteria } from "@/types";
export class CpfRatesService {
  private static instance: CpfRatesService;
  private ratesCache: Map<string, CpfRate> = new Map();

  private constructor() {}

  static getInstance(): CpfRatesService {
    if (!CpfRatesService.instance) {
      CpfRatesService.instance = new CpfRatesService();
    }
    return CpfRatesService.instance;
  }

  async fetchRates(): Promise<void> {
    // Simulate API call to fetch rates
    const mockRates = [
      {
        criteria: { minAge: 0, maxAge: 55, minWage: 0, maxWage: 6000 },
        rates: {
          employeeRate: 0.2,
          employerRate: 0.17,
          allocationRatios: { ordinary: 0.6, special: 0.2, medisave: 0.2 },
        },
      },
      {
        criteria: { minAge: 55, maxAge: 60, minWage: 0, maxWage: 6000 },
        rates: {
          employeeRate: 0.13,
          employerRate: 0.13,
          allocationRatios: { ordinary: 0.46, special: 0.24, medisave: 0.3 },
        },
      },
      // Add more age brackets and wage ranges
    ];

    mockRates.forEach((rate) => {
      const key = this.generateRateKey(rate.criteria);
      this.ratesCache.set(key, rate.rates);
    });
  }

  private generateRateKey(criteria: CpfRatesCriteria): string {
    return `${criteria.minAge}-${criteria.maxAge}-${criteria.minWage}-${criteria.maxWage}`;
  }

  getRates(age: number, wage: number): CpfRate {
    // Find matching rate based on age and wage brackets
    // In production, this would be more sophisticated
    if (age <= 55) {
      return {
        employeeRate: 0.2,
        employerRate: 0.17,
        allocationRatios: { ordinary: 0.6, special: 0.2, medisave: 0.2 },
      };
    }
    // Add more conditions
    return {
      employeeRate: 0.05,
      employerRate: 0.075,
      allocationRatios: { ordinary: 0.3, special: 0.3, medisave: 0.4 },
    };
  }
}
