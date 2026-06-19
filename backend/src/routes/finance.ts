import { Router } from "express";
import {
  getApprovedBudget,
  getForex,
  getHandlingBatchDetail,
  getKpis,
  getNetMarginProfitability,
  getOverview,
  getRevenueBreakdown,
  getRevenuePort,
  getRevenueSegment,
  getSales,
  getSalesBatchDetail,
  getVesselHandling,
  getVesselSales,
  getWorkingCapital,
} from "../controllers/financeController.js";

const router = Router();

router.get("/overview", getOverview);
router.get("/kpis", getKpis);
router.get("/forex", getForex);
router.get("/revenue", getRevenueBreakdown);
router.get("/revenue/port", getRevenuePort);
router.get("/revenue/segment", getRevenueSegment);
router.get("/working-capital", getWorkingCapital);

// Profitability suite (Net Margin + vessel drilldowns)
router.get("/profitability", getNetMarginProfitability);
router.get("/profitability/vessels/sales", getVesselSales);
router.get("/profitability/vessels/handling", getVesselHandling);
router.get("/profitability/vessels/sales/:batchId", getSalesBatchDetail);
router.get("/profitability/vessels/handling/:batchId", getHandlingBatchDetail);

router.get("/sales", getSales);
router.get("/approved-budget", getApprovedBudget);

export default router;
