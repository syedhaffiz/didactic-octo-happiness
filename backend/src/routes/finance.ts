import { Router } from "express";
import {
  getForex,
  getKpis,
  getOverview,
  getProfitability,
  getRevenue,
  getSales,
  getWorkingCapital,
} from "../controllers/financeController.js";

const router = Router();

router.get("/overview", getOverview);
router.get("/kpis", getKpis);
router.get("/forex", getForex);
router.get("/revenue", getRevenue);
router.get("/working-capital", getWorkingCapital);
router.get("/profitability", getProfitability);
router.get("/sales", getSales);

export default router;
