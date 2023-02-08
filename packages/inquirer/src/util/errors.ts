export class TimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TimeoutError";
  }
}

export class InvalidInteractionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidInteractionError";
  }
}
