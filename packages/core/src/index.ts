export const version = "0.1.0";

export class CoreError extends Error {
  constructor(
    message: string,
    public readonly code: string = "CORE_ERROR",
  ) {
    super(message);
    this.name = "CoreError";
  }
}

export * from "./config.js";
export * from "./result.js";
