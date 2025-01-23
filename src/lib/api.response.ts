import { Status } from "./route-error";

class ApiResponse<T> {
  public status: Status;
  public message: string;
  public data: T;

  constructor(status: Status, message: string, data: T) {
    this.status = status;
    this.message = message;
    this.data = data;
  }
}
