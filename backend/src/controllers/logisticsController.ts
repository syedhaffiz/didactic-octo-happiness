import type { RequestHandler } from "express";
import { z } from "zod";
import { logisticsService } from "../services/logisticsService.js";
import { fail, ok } from "../types/api.js";

const dateRangeSchema = z.object({
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
});

const handlingRatesSchema = z.object({
  year: z.string().optional(),
});

const pdaDrillSchema = z.object({
  path: z.string().min(1),
});

const parse = <T>(schema: z.ZodSchema<T>, query: unknown): T => {
  const result = schema.safeParse(query);
  if (!result.success) throw result.error;
  return result.data;
};

export const getVesselsSailed: RequestHandler = async (req, res, next) => {
  try {
    const q = parse(dateRangeSchema, req.query);
    res.json(ok(await logisticsService.vesselsSailed(q)));
  } catch (e) {
    next(e);
  }
};

export const getFiscalYears: RequestHandler = async (_req, res, next) => {
  try {
    res.json(ok(await logisticsService.fiscalYears()));
  } catch (e) {
    next(e);
  }
};

export const getHandlingRates: RequestHandler = async (req, res, next) => {
  try {
    const q = parse(handlingRatesSchema, req.query);
    res.json(ok(await logisticsService.handlingRates(q.year)));
  } catch (e) {
    next(e);
  }
};

export const getPda: RequestHandler = async (_req, res, next) => {
  try {
    res.json(ok(await logisticsService.pda()));
  } catch (e) {
    next(e);
  }
};

export const getOutstanding: RequestHandler = async (_req, res, next) => {
  try {
    res.json(ok(await logisticsService.outstanding()));
  } catch (e) {
    next(e);
  }
};

// Lazy drilldown: the operations split for one PDA port, fetched on slice click.
export const getPdaDrill: RequestHandler = async (req, res, next) => {
  try {
    const q = parse(pdaDrillSchema, req.query);
    const level = await logisticsService.pdaDrill(q.path);
    if (!level) {
      res.status(404).json(fail("not_found", `Unknown drilldown path: ${q.path}`));
      return;
    }
    res.json(ok(level));
  } catch (e) {
    next(e);
  }
};
