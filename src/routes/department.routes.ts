import express from "express";
import {
  getAllDepartments,
  getDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "@/controllers/department.controller";

const router = express.Router();

router.get("/organizations/:organizationId/departments", getAllDepartments);
router.get("/departments/:id", getDepartment);
router.post("/departments", createDepartment);
router.put("/departments/:id", updateDepartment);
router.delete("/departments/:id", deleteDepartment);

export default router;
