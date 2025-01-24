import { db } from "@/db/database";
import { organizationSchema } from "@/validations/validation";
import { Request, Response } from "express";
import asyncHandler from "express-async-handler";

// Get all organizations
export const getAllOrganizations = asyncHandler(async (req: Request, res: Response) => {
  const organizations = await db.selectFrom("organizations").selectAll().execute();
  res.json(organizations);
});

// Get an organization by ID
export const getOrganization = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const organization = await db
    .selectFrom("organizations")
    .selectAll()
    .where("id", "=", id)
    .executeTakeFirst();

  if (!organization) {
    res.status(404).json({ error: "Organization not found" });
  } else {
    res.json(organization);
  }
});

// Create a new organization
export const createOrganization = asyncHandler(async (req: Request, res: Response) => {
  const newOrganization = organizationSchema.parse({ ...req.body, updated_at: new Date() });

  const [createdOrganization] = await db
    .insertInto("organizations")
    .values(newOrganization)
    .returningAll()
    .execute();
  res.status(201).json(createdOrganization);
});

// Update an existing organization
export const updateOrganization = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = organizationSchema.parse(req.body);
  const [updatedOrganization] = await db
    .updateTable("organizations")
    .set(updates)
    .where("id", "=", id)
    .returningAll()
    .execute();
  if (!updatedOrganization) {
    res.status(404).json({ error: "Organization not found" });
  } else {
    res.json(updatedOrganization);
  }
});

// Soft-delete an organization
export const deleteOrganization = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const [deletedOrganization] = await db
    .updateTable("organizations")
    .set({ deleted_at: new Date() })
    .where("id", "=", id)
    .returningAll()
    .execute();
  if (!deletedOrganization) {
    res.status(404).json({ error: "Organization not found" });
  } else {
    res.json(deletedOrganization);
  }
});
