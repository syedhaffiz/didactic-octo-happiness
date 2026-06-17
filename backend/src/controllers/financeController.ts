import type { RequestHandler } from "express";
import { z } from "zod";
import { financeService } from "../services/financeService.js";
import { parseDateRange } from "../services/dateRange.js";
import { ok } from "../types/api.js";

const dateRangeSchema = z.object({
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
});

const portFilterSchema = dateRangeSchema.extend({
  port: z.string().optional(),
});

const profitabilitySchema = dateRangeSchema.extend({
  mode: z.enum(["port", "segment"]).optional(),
  port: z.string().optional(),
  segment: z.string().optional(),
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

export const getRevenue: RequestHandler = async (req, res, next) => {
  try {
    const q = parse(portFilterSchema, req.query);
    const { from, to } = parseDateRange(q.fromDate, q.toDate);
    res.json(ok(await financeService.revenue(q.port, from, to)));
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

export const getProfitability: RequestHandler = async (req, res, next) => {
  try {
    const q = parse(profitabilitySchema, req.query);
    const { from, to } = parseDateRange(q.fromDate, q.toDate);
    const mode = q.mode ?? "port";
    const filter = mode === "port" ? q.port : q.segment;
    res.json(ok(await financeService.profitability(mode, filter, from, to)));
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
