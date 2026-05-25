import type { RequestHandler } from "express";
import { z } from "zod";
import { inventoryService } from "../services/inventoryService.js";
import { ok } from "../types/api.js";

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

export const getOverview: RequestHandler = async (req, res, next) => {
  try {
    const q = parse(overviewSchema, req.query);
    res.json(ok(await inventoryService.overview(q)));
  } catch (e) {
    next(e);
  }
};
