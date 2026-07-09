import type { RequestHandler } from "express";
import { z } from "zod";
import { filtersService } from "../services/filtersService.js";
import { ok } from "../types/api.js";

export const getAll: RequestHandler = async (_req, res, next) => {
  try {
    res.json(ok(await filtersService.all()));
  } catch (e) {
    next(e);
  }
};

const portsByZoneSchema = z.object({ zone: z.string().optional() });

export const getPortsByZone: RequestHandler = async (req, res, next) => {
  try {
    const q = portsByZoneSchema.safeParse(req.query);
    if (!q.success) throw q.error;
    res.json(ok(await filtersService.portsByZone(q.data.zone)));
  } catch (e) {
    next(e);
  }
};
