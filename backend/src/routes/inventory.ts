import { Router } from "express";
import {
  getIndex,
  getIndices,
  getOverview,
  getVesselsSailedOut,
  getVesselsUnderloading,
} from "../controllers/inventoryController.js";

const router = Router();

router.get("/index", getIndices);
// Per-code: /api/inventory/index/ICI%204?range=1W
router.get("/index/:code", getIndex);
router.get("/overview", getOverview);
// Vessel tables — separate endpoints, same filter params as /overview.
router.get("/vessels/sailed-out", getVesselsSailedOut);
router.get("/vessels/under-loading", getVesselsUnderloading);

export default router;
