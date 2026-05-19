import type { RequestHandler } from "express";
import { filtersService } from "../services/filtersService.js";
import { ok } from "../types/api.js";

export const getPorts: RequestHandler = async (_req, res, next) => {
  try {
    res.json(ok(await filtersService.ports()));
  } catch (e) {
    next(e);
  }
};

export const getSegments: RequestHandler = async (_req, res, next) => {
  try {
    res.json(ok(await filtersService.segments()));
  } catch (e) {
    next(e);
  }
};

export const getZones: RequestHandler = async (_req, res, next) => {
  try {
    res.json(ok(await filtersService.zones()));
  } catch (e) {
    next(e);
  }
};
