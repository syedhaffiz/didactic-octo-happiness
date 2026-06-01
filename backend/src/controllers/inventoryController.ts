import type { RequestHandler } from "express";
import { z } from "zod";
import { inventoryService } from "../services/inventoryService.js";
import { fail, ok } from "../types/api.js";

const indexSchema = z.object({
  range: z.enum(["1W", "1M", "3M", "1Y"]).optional(),
});

const overviewSchema = z.object({
  port: z.string().optional(),
  origin: z.string().optional(),
  grade: z.string().optional(),
});

const parse = <T>(schema: z.ZodSchema<T>, query: unknown): T => {
  const result = schema.safeParse(query);
  if (!result.success) throw result.error;
  return result.data;
};

export const getIndices: RequestHandler = async (req, res, next) => {
  try {
    const q = parse(indexSchema, req.query);
    res.json(ok(await inventoryService.indices(q.range ?? "1M")));
  } catch (e) {
    next(e);
  }
};

// Per-code variant so each card on the Index page can drive its own range
// independently.
export const getIndex: RequestHandler = async (req, res, next) => {
  try {
    const q = parse(indexSchema, req.query);
    const code = decodeURIComponent(req.params.code ?? "");
    const result = await inventoryService.index(code, q.range ?? "1M");
    if (!result) {
      res.status(404).json(fail("not_found", `Unknown index code: ${code}`));
      return;
    }
    res.json(ok(result));
  } catch (e) {
    next(e);
  }
};

export const getOverview: RequestHandler = async (req, res, next) => {
  try {
    const q = parse(overviewSchema, req.query);
    res.json(ok(await inventoryService.overview(q)));
  } catch (e) {
    next(e);
  }
};

// Vessels are their own endpoints — same filters as overview, but each
// table is fetched independently so the page can render KPIs/charts
// without waiting on the (potentially larger) vessel lists.
export const getVesselsSailedOut: RequestHandler = async (req, res, next) => {
  try {
    const q = parse(overviewSchema, req.query);
    res.json(ok(await inventoryService.vesselsSailedOut(q)));
  } catch (e) {
    next(e);
  }
};

export const getVesselsUnderloading: RequestHandler = async (req, res, next) => {
  try {
    const q = parse(overviewSchema, req.query);
    res.json(ok(await inventoryService.vesselsUnderloading(q)));
  } catch (e) {
    next(e);
  }
};
