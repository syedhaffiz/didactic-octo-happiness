import { Router } from "express";
import {
  getFiscalYears,
  getHandlingRates,
  getOutstanding,
  getPda,
  getPdaDrill,
  getVesselsSailed,
} from "../controllers/logisticsController.js";

const router = Router();

// One endpoint per card — no aggregate overview.
router.get("/vessels-sailed", getVesselsSailed);
// Fiscal-year list for the Handling Rates dropdown; the card passes the chosen
// year (e.g. ?year=2025-26) to /handling-rates.
router.get("/fiscal-year", getFiscalYears);
router.get("/handling-rates", getHandlingRates);
router.get("/pda", getPda);
// Lazy PDA drilldown level: /api/logistics/pda/drill?path=pda-pradip
router.get("/pda/drill", getPdaDrill);
router.get("/outstanding", getOutstanding);

export default router;
