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

// Shared query schema for every Market Share data endpoint. Multiselect
// filters (fiscalYears, quarters) arrive comma-joined; the rest are ids.
const marketShareFilterSchema = z.object({
  fiscalYears: z.string().optional(),
  quarters: z.string().optional(),
  share: z.string().optional(),
  zone: z.string().optional(),
  port: z.string().optional(),
  origin: z.string().optional(),
  segment: z.string().optional(),
  addressable: z.string().optional(),
  industry: z.string().optional(),
  category: z.string().optional(),
  shipperName: z.string().optional(),
  receiverName: z.string().optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
});

export const getMarketShareSplit: RequestHandler = async (req, res, next) => {
  try {
    res.json(ok(await marketingService.marketShareSplit(parse(marketShareFilterSchema, req.query))));
  } catch (e) {
    next(e);
  }
};

export const getMarketShareImportQuantity: RequestHandler = async (req, res, next) => {
  try {
    res.json(
      ok(await marketingService.marketShareImportQuantity(parse(marketShareFilterSchema, req.query))),
    );
  } catch (e) {
    next(e);
  }
};

export const getMarketShareByCategory: RequestHandler = async (req, res, next) => {
  try {
    res.json(
      ok(await marketingService.marketShareByCategory(parse(marketShareFilterSchema, req.query))),
    );
  } catch (e) {
    next(e);
  }
};

export const getMarketShareQuarterwise: RequestHandler = async (req, res, next) => {
  try {
    res.json(
      ok(await marketingService.marketShareQuarterwise(parse(marketShareFilterSchema, req.query))),
    );
  } catch (e) {
    next(e);
  }
};

export const getMarketShareIndustrywise: RequestHandler = async (req, res, next) => {
  try {
    res.json(
      ok(await marketingService.marketShareIndustrywise(parse(marketShareFilterSchema, req.query))),
    );
  } catch (e) {
    next(e);
  }
};

export const getMarketShareOriginwise: RequestHandler = async (req, res, next) => {
  try {
    res.json(
      ok(await marketingService.marketShareOriginwise(parse(marketShareFilterSchema, req.query))),
    );
  } catch (e) {
    next(e);
  }
};

export const getMarketSharePortwise: RequestHandler = async (req, res, next) => {
  try {
    res.json(
      ok(await marketingService.marketSharePortwise(parse(marketShareFilterSchema, req.query))),
    );
  } catch (e) {
    next(e);
  }
};

// Dropdown option lists for the Filters side-panel.
export const getMarketShareFilterOptions: RequestHandler = async (_req, res, next) => {
  try {
    res.json(ok(await marketingService.marketShareFilterOptions()));
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
