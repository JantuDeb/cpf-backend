import {
  createOrganization,
  deleteOrganization,
  getAllOrganizations,
  getOrganization,
  updateOrganization,
} from "@/controllers/organisation.controller";
import express from "express";

const router = express.Router();

// Get all organizations
router.get("/organizations", getAllOrganizations);

// Get an organization by ID
router.get("/organizations/:id", getOrganization);

// Create a new organization
router.post("/organizations", createOrganization);

// Update an existing organization
router.put("/organizations/:id", updateOrganization);

// Soft-delete an organization
router.delete("/organizations/:id", deleteOrganization);

export default router;
