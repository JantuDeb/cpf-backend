import { db } from "@/db/database";
import { departmentSchema } from "@/validations/validation";
import { Request, Response } from "express";
import asyncHandler from "express-async-handler";

export const getAllDepartments = asyncHandler(async (req: Request, res: Response) => {
  const { organizationId } = req.params;
  const departments = await db
    .selectFrom("departments")
    .selectAll()
    .where("organization_id", "=", organizationId)
    .execute();
  res.json(departments);
});

export const getDepartment = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const department = await db
    .selectFrom("departments")
    .selectAll()
    .where("id", "=", id)
    .executeTakeFirst();
  if (!department) {
    res.status(404).json({ error: "Department not found" });
    return;
  }
  res.json(department);
});

export const createDepartment = asyncHandler(async (req: Request, res: Response) => {
  const data = departmentSchema.parse({
    ...req.body,
    updated_at: new Date(),
  });
  const department = await db
    .insertInto("departments")
    .values(data)
    .returningAll()
    .executeTakeFirst();
  res.status(201).json(department);
});

export const updateDepartment = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const values = departmentSchema.parse({ ...req.body, updated_at: new Date() });
  const department = await db
    .updateTable("departments")
    .set(values)
    .where("id", "=", id)
    .returningAll()
    .executeTakeFirst();
  if (!department) {
    res.status(404).json({ error: "Department not found" });
    return;
  }
  res.json(department);
});

export const deleteDepartment = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const department = await db
    .updateTable("departments")
    .set({
      deleted_at: new Date(),
    })
    .where("id", "=", id)
    .returningAll()
    .executeTakeFirst();
  if (!department) {
    res.status(404).json({ error: "Department not found" });
    return;
  }
  res.json(department);
});
