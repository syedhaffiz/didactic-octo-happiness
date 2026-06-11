import { Router } from "express";
import {
  getIndex,
  getIndices,
  getMarketShare,
  getOceanFreight,
  getTarget,
} from "../controllers/marketingController.js";

const router = Router();

router.get("/indices", getIndices);
// Per-code: /api/marketing/indices/ICI%20Index?range=1W
router.get("/indices/:code", getIndex);
router.get("/market-share", getMarketShare);
router.get("/ocean-freight", getOceanFreight);
router.get("/target", getTarget);

export default router;
