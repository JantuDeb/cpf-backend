// logger.ts
import { createLogger, format, transports } from "winston";
import path from "path";

const logger = createLogger({
  format: format.combine(format.timestamp(), format.json()),
  transports: [
    // Console logging
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    }),
    // File logging
    new transports.File({
      filename: path.join(__dirname, "../logs/payroll-worker.log"),
      format: format.combine(format.timestamp(), format.json()),
    }),
  ],
});

export default logger;
