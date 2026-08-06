import { Router } from "express";
import {
  getIndex,
  getIndices,
  getMarketShareSplit,
  getMarketShareImportQuantity,
  getMarketShareByCategory,
  getMarketShareQuarterwise,
  getMarketShareIndustrywise,
  getMarketShareOriginwise,
  getMarketSharePortwise,
  getMarketShareFilterOptions,
  getOceanFreight,
  getTarget,
} from "../controllers/marketingController.js";

const router = Router();

router.get("/indices", getIndices);
// Per-code: /api/marketing/indices/ICI%20Index?range=1W
router.get("/indices/:code", getIndex);

// Market Share — one endpoint per card, all accepting the shared filter query.
router.get("/market-share/split", getMarketShareSplit);
router.get("/market-share/import-quantity", getMarketShareImportQuantity);
router.get("/market-share/by-category", getMarketShareByCategory);
router.get("/market-share/quarterwise", getMarketShareQuarterwise);
router.get("/market-share/industrywise", getMarketShareIndustrywise);
router.get("/market-share/originwise", getMarketShareOriginwise);
router.get("/market-share/portwise", getMarketSharePortwise);
router.get("/market-share/filters", getMarketShareFilterOptions);

router.get("/ocean-freight", getOceanFreight);
router.get("/target", getTarget);

export default router;
