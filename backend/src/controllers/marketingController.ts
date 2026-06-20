import type { RequestHandler } from "express";
import { z } from "zod";
import { marketingService } from "../services/marketingService.js";
import { fail, ok } from "../types/api.js";

const rangeSchema = z.object({
  range: z.enum(["1", "2"]).optional(),
});

const dateRangeSchema = z.object({
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
});

const oceanFreightSchema = z.object({
  dischargePort: z.string().optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
});

const parse = <T>(schema: z.ZodSchema<T>, query: unknown): T => {
  const result = schema.safeParse(query);
  if (!result.success) throw result.error;
  return result.data;
};

export const getIndices: RequestHandler = async (req, res, next) => {
  try {
    const q = parse(rangeSchema, req.query);
    res.json(ok(await marketingService.indices(q.range ?? "1")));
  } catch (e) {
    next(e);
  }
};

// Per-code so each Index Movement card drives its own range independently.
export const getIndex: RequestHandler = async (req, res, next) => {
  try {
    const q = parse(rangeSchema, req.query);
    const code = decodeURIComponent(req.params.code ?? "");
    const result = await marketingService.index(code, q.range ?? "1");
    if (!result) {
      res.status(404).json(fail("not_found", `Unknown index code: ${code}`));
      return;
    }
    res.json(ok(result));
  } catch (e) {
    next(e);
  }
};

export const getMarketShare: RequestHandler = async (req, res, next) => {
  try {
    const q = parse(dateRangeSchema, req.query);
    res.json(ok(await marketingService.marketShare(q)));
  } catch (e) {
    next(e);
  }
};

export const getOceanFreight: RequestHandler = async (req, res, next) => {
  try {
    const q = parse(oceanFreightSchema, req.query);
    res.json(ok(await marketingService.oceanFreight(q)));
  } catch (e) {
    next(e);
  }
};

export const getTarget: RequestHandler = async (req, res, next) => {
  try {
    const q = parse(dateRangeSchema, req.query);
    res.json(ok(await marketingService.target(q)));
  } catch (e) {
    next(e);
  }
};
