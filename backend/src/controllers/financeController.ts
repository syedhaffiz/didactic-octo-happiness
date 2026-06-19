import type { RequestHandler } from "express";
import { z } from "zod";
import { financeService } from "../services/financeService.js";
import { parseDateRange } from "../services/dateRange.js";
import { fail, ok } from "../types/api.js";
import type { Currency } from "../types/finance.js";

const dateRangeSchema = z.object({
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
});

const portFilterSchema = dateRangeSchema.extend({
  port: z.string().optional(),
});

const netMarginSchema = portFilterSchema.extend({
  currency: z.enum(["INR", "USD"]).optional(),
});

const forexSchema = z.object({
  range: z.enum(["all", "week", "month"]).optional(),
});

const approvedBudgetSchema = z.object({
  port: z.string().optional(),
  grade: z.string().optional(),
  zone: z.string().optional(),
  origin: z.string().optional(),
  fy: z.string().optional(),
});

const parse = <T>(schema: z.ZodSchema<T>, query: unknown): T => {
  const result = schema.safeParse(query);
  if (!result.success) throw result.error;
  return result.data;
};

export const getOverview: RequestHandler = async (req, res, next) => {
  try {
    const q = parse(dateRangeSchema, req.query);
    const { from, to } = parseDateRange(q.fromDate, q.toDate);
    res.json(ok(await financeService.overview(from, to)));
  } catch (e) {
    next(e);
  }
};

export const getKpis: RequestHandler = async (req, res, next) => {
  try {
    const q = parse(dateRangeSchema, req.query);
    const { from, to } = parseDateRange(q.fromDate, q.toDate);
    res.json(ok(await financeService.kpis(from, to)));
  } catch (e) {
    next(e);
  }
};

export const getForex: RequestHandler = async (req, res, next) => {
  try {
    const q = parse(forexSchema, req.query);
    res.json(ok(await financeService.forex(q.range ?? "week", new Date())));
  } catch (e) {
    next(e);
  }
};

const revenueBreakdownSchema = z.object({
  period: z.enum(["YTD", "MTD"]).optional(),
});

const portOnlySchema = z.object({ port: z.string().optional() });
const segmentOnlySchema = z.object({ segment: z.string().optional() });

export const getRevenueBreakdown: RequestHandler = async (req, res, next) => {
  try {
    const q = parse(revenueBreakdownSchema, req.query);
    res.json(ok(await financeService.revenueBreakdown(q.period ?? "YTD")));
  } catch (e) {
    next(e);
  }
};

export const getRevenuePort: RequestHandler = async (req, res, next) => {
  try {
    const q = parse(portOnlySchema, req.query);
    res.json(ok(await financeService.revenuePort(q.port)));
  } catch (e) {
    next(e);
  }
};

export const getRevenueSegment: RequestHandler = async (req, res, next) => {
  try {
    const q = parse(segmentOnlySchema, req.query);
    res.json(ok(await financeService.revenueSegment(q.segment)));
  } catch (e) {
    next(e);
  }
};

export const getWorkingCapital: RequestHandler = async (req, res, next) => {
  try {
    const q = parse(portFilterSchema, req.query);
    const { from, to } = parseDateRange(q.fromDate, q.toDate);
    res.json(ok(await financeService.workingCapital(q.port, from, to)));
  } catch (e) {
    next(e);
  }
};

// --- Profitability suite -------------------------------------------------

export const getNetMarginProfitability: RequestHandler = async (req, res, next) => {
  try {
    const q = parse(netMarginSchema, req.query);
    const { from, to } = parseDateRange(q.fromDate, q.toDate);
    const currency: Currency = q.currency ?? "INR";
    res.json(ok(await financeService.netMarginProfitability(q.port, currency, from, to)));
  } catch (e) {
    next(e);
  }
};

export const getVesselSales: RequestHandler = async (req, res, next) => {
  try {
    const q = parse(portFilterSchema, req.query);
    const { from, to } = parseDateRange(q.fromDate, q.toDate);
    res.json(ok(await financeService.vesselSales(q.port, from, to)));
  } catch (e) {
    next(e);
  }
};

export const getVesselHandling: RequestHandler = async (req, res, next) => {
  try {
    const q = parse(portFilterSchema, req.query);
    const { from, to } = parseDateRange(q.fromDate, q.toDate);
    res.json(ok(await financeService.vesselHandling(q.port, from, to)));
  } catch (e) {
    next(e);
  }
};

export const getSalesBatchDetail: RequestHandler = async (req, res, next) => {
  try {
    const batchId = decodeURIComponent(req.params.batchId ?? "");
    if (!batchId) {
      res.status(400).json(fail("bad_request", "batchId is required"));
      return;
    }
    res.json(ok(await financeService.salesBatchDetail(batchId)));
  } catch (e) {
    next(e);
  }
};

export const getHandlingBatchDetail: RequestHandler = async (req, res, next) => {
  try {
    const batchId = decodeURIComponent(req.params.batchId ?? "");
    if (!batchId) {
      res.status(400).json(fail("bad_request", "batchId is required"));
      return;
    }
    res.json(ok(await financeService.handlingBatchDetail(batchId)));
  } catch (e) {
    next(e);
  }
};

export const getSales: RequestHandler = async (req, res, next) => {
  try {
    const q = parse(dateRangeSchema, req.query);
    const { from, to } = parseDateRange(q.fromDate, q.toDate);
    res.json(ok(await financeService.sales(from, to)));
  } catch (e) {
    next(e);
  }
};

export const getApprovedBudget: RequestHandler = async (req, res, next) => {
  try {
    const q = parse(approvedBudgetSchema, req.query);
    res.json(ok(await financeService.approvedBudget(q)));
  } catch (e) {
    next(e);
  }
};
