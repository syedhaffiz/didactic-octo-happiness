import type { RequestHandler } from "express";
import { z } from "zod";
import { legalService } from "../services/legalService.js";
import { fail, ok } from "../types/api.js";

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

export const getCaseByNo: RequestHandler = async (req, res, next) => {
  try {
    const caseNo = decodeURIComponent(req.params.caseNo ?? "");
    const result = await legalService.caseByNo(caseNo);
    if (!result) {
      res.status(404).json(fail("not_found", `Unknown case: ${caseNo}`));
      return;
    }
    res.json(ok(result));
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
