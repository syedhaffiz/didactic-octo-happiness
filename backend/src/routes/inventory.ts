import { Router } from "express";
import {
  getIndex,
  getIndices,
  getOverview,
} from "../controllers/inventoryController.js";

const router = Router();

router.get("/index", getIndices);
// Per-code: /api/inventory/index/ICI%204?range=1W
router.get("/index/:code", getIndex);
router.get("/overview", getOverview);

export default router;
