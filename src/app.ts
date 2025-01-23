import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { Request, Response, NextFunction } from "express";
import { fromError, fromZodError, isValidationError, isZodErrorLike } from "zod-validation-error";

import env from "./lib/env";

//Routes

import healthRoute from "./routes/health.route";
import organizationRoutes from "./routes/organization.routes";
import employeeRoutes from "./routes/employee.routes";
import departmentRoutes from "./routes/department.routes";
import payrollRoutes from "./routes/payroll.routes";

//Error util
import HttpStatusCodes from "./lib/http-status.code";
import { RouteError } from "./lib/route-error";
import { MulterError } from "multer";

const app = express();

// Middlewares
app.use(morgan("dev"));
app.use(helmet());

app.use(
  cors({
    origin: env.APP_ORIGIN,
  }),
);

app.use(express.json());
// app.use(express.urlencoded());

// Routes
app.use("/api_v1", healthRoute);
app.use("/api_v1", organizationRoutes);
app.use("/api_v1", employeeRoutes);
app.use("/api_v1", departmentRoutes);
app.use("/api_v1", payrollRoutes);

// Error middlewares

// Add error handler
app.use((err: Error, _: Request, res: Response, next: NextFunction) => {
  if (env.NODE_ENV !== "test") {
  }
  let status_code = HttpStatusCodes.BAD_REQUEST;
  if (err instanceof RouteError) {
    status_code = err.status_code;
    res.status(err.status_code).json(err);
  }

  if (err instanceof MulterError) {
    status_code = HttpStatusCodes.BAD_REQUEST;
    res.status(status_code).json({ error: err.message });
  }
  if (isZodErrorLike(err)) {
    status_code = HttpStatusCodes.BAD_REQUEST;
    res.status(status_code).json({ error: fromZodError(err) });
  }

  console.log("err", err);
  if (err.message) {
    status_code = HttpStatusCodes.SERVICE_UNAVAILABLE;
    res.status(status_code).json({ error: err.message });
    return;
  }
  return next(err);
});

export default app;
