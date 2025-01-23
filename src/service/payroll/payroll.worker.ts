import { Worker, Job } from "bullmq";
import { IPayrollProcessRequest } from "@/validations/validation";
import { PayrollService } from "@/service/payroll/payroll.service";
import { connection } from "@/db/redis";
export class PayrollWorker {
  worker: Worker;
  private payrollService: PayrollService;

  constructor() {
    this.payrollService = new PayrollService();
    this.worker = new Worker(
      "payroll-queue",
      async (job: Job) => {
        await this.processJob(job);
      },
      {
        connection,
        concurrency: 1,
        limiter: {
          max: 1,
          duration: 1000, // Rate limit: 1 job per second
        },
      },
    );
    this.setupWorkerEvents();
  }

  private setupWorkerEvents() {
    this.worker.on("completed", (job) => {
      console.log(`Job ${job.id} completed successfully`);
      console.log("Result:", job.returnvalue);
    });

    this.worker.on("failed", (job, error) => {
      console.error(`Job ${job?.id} failed:`, error);
    });

    this.worker.on("error", (error) => {
      console.error("Worker error:", error);
    });

    this.worker.on("active", (job) => {
      console.log(`Processing job ${job.id}`);
    });

    this.worker.on("progress", (job, progress) => {
      console.log(`Job ${job.id} progress: ${progress}%`);
    });
  }

  private async processJob(job: Job<IPayrollProcessRequest>) {
    const { organization_id, year, month, employee_ids } = job.data;

    try {
      // Update job progress
      await job.updateProgress(10);
      console.log(`Starting payroll processing for org ${organization_id}`);

      const processed = await this.payrollService.processPayroll(job.data);

      // Update final progress
      await job.updateProgress(100);

      if (processed) {
        return {
          organization_id,
          year,
          month,
          processed,
          completedAt: new Date().toISOString(),
        };
      }
    } catch (error) {
      console.error(`Failed to process payroll job ${job.id}:`, error);
      throw error;
    }
  }
}
