import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { fail } from "../types/api.js";

export class HttpError extends Error {
  status: number;
  code: string;
  details?: unknown;
  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    res.status(400).json(fail("validation_error", "Invalid request", err.flatten()));
    return;
  }
  if (err instanceof HttpError) {
    res.status(err.status).json(fail(err.code, err.message, err.details));
    return;
  }
  const message = err instanceof Error ? err.message : "Unknown error";
  res.status(500).json(fail("internal_error", message));
};
