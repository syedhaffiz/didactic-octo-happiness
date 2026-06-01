import type { RequestHandler } from "express";
import { filtersService } from "../services/filtersService.js";
import { ok } from "../types/api.js";

export const getAll: RequestHandler = async (_req, res, next) => {
  try {
    res.json(ok(await filtersService.all()));
  } catch (e) {
    next(e);
  }
};
