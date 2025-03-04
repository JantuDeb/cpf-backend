import { db } from "@/db/database";
import HttpStatusCodes from "@/lib/http-status.code";
import { RouteError } from "@/lib/route-error";
import { employeeSchema } from "@/validations/validation";
import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { z } from "zod";
import csv from "csvtojson";
import { Readable } from "node:stream";

// Get all employees
export const getAllEmployees = asyncHandler(async (req: Request, res: Response) => {
  const { organizationId } = req.params;
  await new Promise((resolve) => setTimeout(resolve, 1000)); 
  const employees = await db
    .selectFrom("employees")
    .selectAll()
    .where("organization_id", "=", organizationId)
    .execute();
  res.json(employees);
});

// Get an employee by ID
export const getEmployee = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const employee = await db
    .selectFrom("employees")
    .selectAll()
    .where("id", "=", id)
    .executeTakeFirst();

  if (!employee) {
    res.status(404).json({ error: "Employee not found" });
  } else {
    res.json(employee);
  }
});

// Create an employee
export const createEmployee = asyncHandler(async (req: Request, res: Response) => {
  const data = employeeSchema.parse({
    ...req.body,
    updated_at: new Date(),
  });
  const employee = await db.insertInto("employees").values(data).returningAll().executeTakeFirst();
  if (!employee) {
    res
      .status(HttpStatusCodes.BAD_REQUEST)
      .json(new RouteError(HttpStatusCodes.BAD_REQUEST, "Employee not created", "FAILURE"));
    return;
  }

  res.status(201).json(employee);
});

// Update an employee
export const updateEmployee = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const values = employeeSchema.parse({ ...req.body, updated_at: new Date() });

  const employee = await db
    .updateTable("employees")
    .set(values)
    .where("id", "=", id)
    .returningAll()
    .executeTakeFirst();

  if (!employee) {
    res
      .status(HttpStatusCodes.NOT_FOUND)
      .json(new RouteError(HttpStatusCodes.NOT_FOUND, "Employee not updated", "FAILURE"));
    return;
  }

  res.json(employee);
});

// Soft delete an employee
export const deleteEmployee = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const employee = await db
    .updateTable("employees")
    .set({
      deleted_at: new Date(),
      is_active: false,
    })
    .where("id", "=", id)
    .returningAll()
    .executeTakeFirst();

  if (!employee) {
    res
      .status(HttpStatusCodes.NOT_FOUND)
      .json(new RouteError(HttpStatusCodes.NOT_FOUND, "Employee not deleted", "FAILURE"));
    return;
  }
  res.json(employee);
});

export const bulkImportEmployees = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: "No CSV file uploaded" });
    return;
  }
  console.log("req.file", req.file);

  const { organization_id } = req.body;
  const jsonArray = await csv().fromStream(Readable.from(req.file.buffer));
  console.log("jsonArray", jsonArray);
  const updated_at = new Date();

  const validatedEmployees = jsonArray.map((emp) =>
    employeeSchema.parse({
      ...emp,
      organization_id,
      updated_at,
      is_active: true,
    }),
  );

  await db.insertInto("employees").values(validatedEmployees).executeTakeFirstOrThrow();

  res.status(201).json({
    message: `Successfully imported  employees`,
  });
});
