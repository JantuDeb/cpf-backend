// import { Worker, Job } from "bullmq";
// import { Redis } from "ioredis";
// import env from "@/lib/env";
// import { IPayrollProcessRequest } from "@/validations/validation";
// import { PayrollService } from "@/service/payroll/payroll.service";

// export class PayrollWorker {
//    worker: Worker;
//   private payrollService: PayrollService;

//   constructor() {
//     const connection = new Redis(env.REDIS_PORT);
//     this.payrollService = new PayrollService();

//     this.worker = new Worker(
//       "payroll-queue",
//       async (job: Job) => {
//         await this.processJob(job);
//       },
//       {
//         connection,
//         concurrency: 1, // Process one job at a time
//       },
//     );

//     this.setupWorkerEvents();
//   }

//   private setupWorkerEvents() {
//     this.worker.on("completed", (job) => {
//       console.log(`Job ${job.id} completed successfully`);
//     });

//     this.worker.on("failed", (job, error) => {
//       console.error(`Job ${job?.id} failed:`, error);
//     });

//     this.worker.on("error", (error) => {
//       console.error("Worker error:", error);
//     });
//   }

//   private async processJob(job: Job<IPayrollProcessRequest>) {
//     const { organization_id, year, month, employee_ids } = job.data;

//     try {
//       // Update progress to started
//       await job.updateProgress(0);

//       // Get employees to process
//       const employees = employee_ids?.length
//         ? await this.payrollService.getEmployees(organization_id, employee_ids)
//         : await this.payrollService.getAllEmployees(organization_id);

//       const totalEmployees = employees.length;
//       let processedCount = 0;

//       // Process each employee's payroll
//       for (const employee of employees) {
//         try {
//           await this.payrollService.processEmployeePayroll({
//             organization_id,
//             employee_id: employee.id,
//             year,
//             month,
//           });

//           processedCount++;
//           await job.updateProgress((processedCount / totalEmployees) * 100);
//         } catch (error) {
//           console.error(`Failed to process payroll for employee ${employee.id}:`, error);
//           // Continue processing other employees even if one fails
//         }
//       }

//       // Return summary
//       return {
//         organization_id,
//         year,
//         month,
//         total_employees: totalEmployees,
//         processed_employees: processedCount,
//         success_rate: (processedCount / totalEmployees) * 100,
//       };
//     } catch (error) {
//       console.error(`Failed to process payroll job ${job.id}:`, error);
//       throw error; // This will mark the job as failed
//     }
//   }
// }

// // Start the worker
// const worker = new PayrollWorker();

// // Handle process termination
// process.on("SIGTERM", async () => {
//   await worker.worker.close();
// });

// process.on("SIGINT", async () => {
//   await worker.worker.close();
// });
