import type { RequestHandler } from "express";
import { z } from "zod";
import { legalService } from "../services/legalService.js";
import { ok } from "../types/api.js";

const filtersSchema = z.object({
  dateRange: z.string().optional(),
});

const parse = <T>(schema: z.ZodSchema<T>, query: unknown): T => {
  const result = schema.safeParse(query);
  if (!result.success) throw result.error;
  return result.data;
};

export const getSummary: RequestHandler = async (req, res, next) => {
  try {
    const q = parse(filtersSchema, req.query);
    res.json(ok(await legalService.summary(q)));
  } catch (e) {
    next(e);
  }
};

export const getCriticalCases: RequestHandler = async (req, res, next) => {
  try {
    const q = parse(filtersSchema, req.query);
    res.json(ok(await legalService.criticalCases(q)));
  } catch (e) {
    next(e);
  }
};

export const getCriticalIssues: RequestHandler = async (req, res, next) => {
  try {
    const q = parse(filtersSchema, req.query);
    res.json(ok(await legalService.criticalIssues(q)));
  } catch (e) {
    next(e);
  }
};
