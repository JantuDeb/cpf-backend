import express from "express";
import multer from "multer";
import {
  getAllEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  bulkImportEmployees,
} from "../controllers/employee.controller";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20971520, // 20mb
  },
});

router.get("/organizations/:organizationId/employees", getAllEmployees);
router.get("/employees/:id", getEmployee);
router.post("/employees", createEmployee);
router.put("/employees/:id", updateEmployee);
router.delete("/employees/:id", deleteEmployee);
router.post("/employees/bulk-import", upload.single("csv"), bulkImportEmployees);

export default router;
