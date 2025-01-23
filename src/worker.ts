import { PayrollWorker } from "@/service/payroll/payroll.worker";
import logger from "./lib/logger";

async function startWorker() {
  try {
    logger.info("🚀 Starting payroll worker...");
    const worker = new PayrollWorker();

    const gracefulShutdown = async (signal: string) => {
      logger.info(`\n${signal} received. Shutting down worker gracefully...`);
      await worker.worker.close();
      logger.info("Worker shutdown complete.");
      process.exit(0);
    };

    // Handle shutdown signals
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));

    // Handle uncaught errors
    process.on("uncaughtException", async (error) => {
      logger.error("Uncaught Exception:", error);
      await gracefulShutdown("UNCAUGHT_EXCEPTION");
    });

    process.on("unhandledRejection", async (reason, promise) => {
      logger.error("Unhandled Rejection at:", { promise, reason });
      await gracefulShutdown("UNHANDLED_REJECTION");
    });
  } catch (error) {
    logger.error("Failed to start worker:", error);
    process.exit(1);
  }
}

startWorker();
