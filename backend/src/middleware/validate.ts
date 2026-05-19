import type { RequestHandler } from "express";
import type { ZodSchema } from "zod";

export const validateQuery =
  <T>(schema: ZodSchema<T>): RequestHandler =>
  (req, _res, next) => {
    const parsed = schema.safeParse(req.query);
    if (!parsed.success) {
      next(parsed.error);
      return;
    }
    (req as unknown as { validatedQuery: T }).validatedQuery = parsed.data;
    next();
  };
