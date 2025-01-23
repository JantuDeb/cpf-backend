import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { Request, Response, NextFunction } from "express";
import { fromError, fromZodError, isValidationError, isZodErrorLike } from "zod-validation-error";

import env from "./lib/env";

//Routes

import healthRoute from "./routes/health.route";
import organisationRoutes from "./routes/organisation.routes";
import HttpStatusCodes from "./lib/http-status.code";
import { RouteError } from "./lib/route-error";
import { ZodError } from "zod";

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
app.use(express.urlencoded());

// Routes
app.use("/api_v1", healthRoute);
app.use("/api_v1", organisationRoutes);

// Error middlewares

// Add error handler
app.use((err: Error, _: Request, res: Response, next: NextFunction) => {
  if (env.NODE_ENV !== "test") {
  }
  let status = HttpStatusCodes.BAD_REQUEST;
  if (err instanceof RouteError) {
    status = err.status;
    res.status(status).json({ error: err.message });
  }
  if (isZodErrorLike(err)) {
    status = HttpStatusCodes.BAD_REQUEST;
    res.status(status).json({ error: fromZodError(err) });
  }

  return next(err);
});

export default app;
