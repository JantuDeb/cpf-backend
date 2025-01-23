import { PayrollController } from "@/controllers/payroll.controller";
import { Router } from "express";

const router = Router();
const payrollController = new PayrollController();

// Process payroll
router.post("/process-payroll", payrollController.processPayroll.bind(payrollController));

// Get job status
router.get("/payroll-job/:jobId", payrollController.getJobStatus.bind(payrollController));

// Get payroll summary
router.get("/payroll-summary", payrollController.getPayrollSummary.bind(payrollController));

// Commented out as it's commented in the controller
// router.delete('/job/:jobId', payrollController.cancelPayrollJob.bind(payrollController));

export default router;
