import { Router } from "express";
import { getOverview, getPdaDrill } from "../controllers/logisticsController.js";

const router = Router();

router.get("/", getOverview);
// Lazy PDA drilldown level: /api/logistics/pda/drill?path=pda-pradip
router.get("/pda/drill", getPdaDrill);

export default router;
