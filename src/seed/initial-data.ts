export const initialSeedData = {
  departments: [
    { code: 'HR', name: 'Human Resources' },
    { code: 'FIN', name: 'Finance' },
    { code: 'IT', name: 'Information Technology' },
    { code: 'SALES', name: 'Sales' },
    { code: 'OPS', name: 'Operations' },
  ],
  leaveTypes: [
    { code: 'AL', name: 'Annual Leave', default_days: 14 },
    { code: 'MC', name: 'Medical Leave', default_days: 14 },
    { code: 'HP', name: 'Hospitalization', default_days: 60 },
    { code: 'CL', name: 'Compassionate Leave', default_days: 3 },
    { code: 'ML', name: 'Maternity Leave', default_days: 98 },
    { code: 'PL', name: 'Paternity Leave', default_days: 14 },
  ],
};
