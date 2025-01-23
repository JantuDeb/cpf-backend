import HttpStatusCodes from "./http-status.code";

export interface IValidationErrFormat {
  error: string;
  parameter: string;
  value?: unknown;
  "more-info"?: string;
}

export type Status = "SUCCESS" | "FAILURE" | "ERROR";
/**
 * Error with status code and message.
 */
export class RouteError extends Error {
  public status_code: HttpStatusCodes;
  public status: Status;

  public constructor(status_code: HttpStatusCodes, message: string, status: Status = "FAILURE") {
    super(message);
    this.status_code = status_code;
    this.status = status;
  }
}

/**
 * Validation in route layer errors.
 */
export class ValidationErr extends RouteError {
  public static MSG = "The following parameter was missing or invalid.";

  public constructor(parameter: string, value?: unknown, moreInfo?: string) {
    const msgObj: IValidationErrFormat = {
      error: ValidationErr.MSG,
      parameter,
      value,
    };
    if (!!moreInfo) {
      msgObj["more-info"] = moreInfo;
    }
    super(HttpStatusCodes.BAD_REQUEST, JSON.stringify(msgObj));
  }
}
