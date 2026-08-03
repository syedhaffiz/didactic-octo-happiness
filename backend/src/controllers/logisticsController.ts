import type { RequestHandler } from "express";
import { z } from "zod";
import { logisticsService } from "../services/logisticsService.js";
import { ok } from "../types/api.js";

const dateRangeSchema = z.object({
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
});

const handlingRatesSchema = z.object({
  year: z.string().optional(),
});

const pdaSchema = z.object({
  period: z.string().optional(),
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

export const getPda: RequestHandler = async (req, res, next) => {
  try {
    const q = parse(pdaSchema, req.query);
    res.json(ok(await logisticsService.pda(q.period)));
  } catch (e) {
    next(e);
  }
};

// Fiscal-year-half list for the PDA card's period dropdown.
export const getPdaPeriods: RequestHandler = async (_req, res, next) => {
  try {
    res.json(ok(await logisticsService.pdaPeriods()));
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
