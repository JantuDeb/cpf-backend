import { PayrollService } from "@/service/payroll/payroll.service";
import { QueueService } from "@/service/queue/queue-payroll.services";
import { payrollProcessSchema } from "@/validations/validation";
import { Request, Response } from "express";
import { z } from "zod";

export class PayrollController {
  private payrollService: PayrollService;
  private queueService: QueueService;

  constructor() {
    this.payrollService = new PayrollService();
    this.queueService = new QueueService();
  }

  async processPayroll(req: Request, res: Response) {
    try {
      const payload = payrollProcessSchema.parse(req.body);
      console.log("payload", payload);

      // Check for existing job active, waiting
      const existingJob = await this.queueService.checkExistingPayrollJob(
        payload.organization_id,
        payload.year,
        payload.month,
      );

      console.log("existingJob", existingJob);

      if (existingJob && existingJob.id) {
        const jobStatus = await this.queueService.getJobStatus(existingJob.id);

        res.status(409).json({
          message: `Payroll job for ${payload.year}-${payload.month} exists`,
          jobId: existingJob.id,
          status: jobStatus,
          isNewJob: false,
        });

        return;
      }

      // If employee_ids is provided, validate they exist
      if (payload.employee_ids?.length) {
        const invalidIds = await this.payrollService.validateEmployees(
          payload.organization_id,
          payload.employee_ids,
        );
        console.log("invalidIds", invalidIds);

        if (invalidIds.length) {
          res.status(400).json({
            error: "Invalid employee IDs provided",
            invalidIds: invalidIds,
          });
          return;
        }
      }

      // Add job to queue
      const job = await this.queueService.addPayrollJob(payload);

      res.json({
        message: `Payroll processing started for ${payload.employee_ids ? "selected" : "all"} employees`,
        jobId: job.id,
        year: payload.year,
        month: payload.month,
        employeeCount: payload.employee_ids?.length || "all",
      });
    } catch (error: any) {
      console.error("Payroll processing error:", error);

      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: "Invalid request data",
          details: error.errors,
        });
        return;
      }

      res.status(400).json({
        error: error.message || "Failed to process payroll request",
      });
    }
  }

  async getJobStatus(req: Request, res: Response) {
    try {
      const jobId = req.params.jobId;

      if (!jobId) {
        res.status(400).json({ error: "Job ID is required" });
        return;
      }

      const status = await this.queueService.getJobStatus(jobId);

      if (!status) {
        res.status(404).json({ error: "Job not found" });
        return;
      }

      res.json(status);
    } catch (error: any) {
      console.error("Job status error:", error);
      res.status(500).json({
        error: error.message || "Failed to fetch job status",
      });
    }
  }

  // async cancelPayrollJob(req: Request, res: Response) {
  //   try {
  //     const jobId = req.params.jobId;

  //     if (!jobId) {
  //       return res.status(400).json({ error: "Job ID is required" });
  //     }

  //     const result = await this.queueService.cancelPayrollJob(jobId);

  //     if (!result.success) {
  //       return res.status(400).json({
  //         error: "Failed to cancel job",
  //         reason: result.reason,
  //       });
  //     }

  //     res.json({
  //       message: "Payroll job cancelled successfully",
  //       jobId,
  //     });
  //   } catch (error: any) {
  //     console.error("Job cancellation error:", error);
  //     res.status(500).json({
  //       error: error.message || "Failed to cancel payroll job",
  //     });
  //   }
  // }

  async getPayrollSummary(req: Request, res: Response) {
    try {
      const { organization_id, year, month } = req.query;

      if (!organization_id || !year || !month) {
        res.status(400).json({
          error: "Organization ID, year, and month are required",
        });
        return;
      }

      const summary = await this.payrollService.getPayrollSummary(
        organization_id as string,
        Number(year),
        Number(month),
      );

      res.json(summary);
    } catch (error: any) {
      console.error("Payroll summary error:", error);
      res.status(500).json({
        error: error.message || "Failed to fetch payroll summary",
      });
    }
  }
}
