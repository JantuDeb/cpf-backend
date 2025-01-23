import env from "@/lib/env";
import { IPayrollProcessRequest } from "@/validations/validation";
import { Queue, Job } from "bullmq";
import { connection } from "@/db/redis";

export class QueueService {
  private payrollQueue: Queue;

  constructor() {
    this.payrollQueue = new Queue("payroll-queue", { connection });
  }

  async checkExistingPayrollJob(
    organizationId: string,
    year: number,
    month: number,
  ): Promise<Job | null> {
    const existingJobs = await this.payrollQueue.getJobs([
      "active",
      "waiting",
      "completed",
      "failed",
      "paused",
    ]);
    return (
      existingJobs.find(
        (job) =>
          job.data.organization_id === organizationId &&
          job.data.year === year &&
          job.data.month === month,
      ) || null
    );
  }

  async addPayrollJob(payload: IPayrollProcessRequest): Promise<Job> {
    return this.payrollQueue.add("process-payroll", payload, {
      jobId: `payroll-${payload.organization_id}-${payload.year}-${payload.month}`,
      removeOnComplete: false,
      removeOnFail: false,
    });
  }

  async getJobStatus(jobId: string) {
    const job = await this.payrollQueue.getJob(jobId);
    if (!job) return null;

    const state = await job.getState();
    return {
      id: job.id,
      state,
      progress: job.progress || 0,
      result: job.returnvalue,
      data: job.data,
      failedReason: job.failedReason,
    };
  }

  async cancelPayrollJob(jobId: string): Promise<{ success: boolean; reason?: string }> {
    const job = await this.payrollQueue.getJob(jobId);

    if (!job) {
      return { success: false, reason: "Job not found" };
    }

    const state = await job.getState();
    if (state === "completed" || state === "failed") {
      return { success: false, reason: `Job already ${state}` };
    }

    try {
      await job.remove();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        reason: error instanceof Error ? error.message : "Failed to cancel job",
      };
    }
  }

  async cleanupOldJobs(daysToKeep: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const completedJobs = await this.payrollQueue.getJobs(["completed", "failed"]);

    for (const job of completedJobs) {
      const jobDate = job.finishedOn ? new Date(job.finishedOn) : null;
      if (jobDate && jobDate < cutoffDate) {
        await job.remove();
      }
    }
  }

  async getQueueMetrics() {
    const [waiting, active, completed, failed] = await Promise.all([
      this.payrollQueue.getWaitingCount(),
      this.payrollQueue.getActiveCount(),
      this.payrollQueue.getCompletedCount(),
      this.payrollQueue.getFailedCount(),
    ]);

    return {
      waiting,
      active,
      completed,
      failed,
      total: waiting + active + completed + failed,
    };
  }

  async close() {
    await this.payrollQueue.close();
  }
}
