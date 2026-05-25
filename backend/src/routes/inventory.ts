import { Router } from "express";
import { getIndices, getOverview } from "../controllers/inventoryController.js";

const router = Router();

router.get("/index", getIndices);
router.get("/overview", getOverview);

export default router;
