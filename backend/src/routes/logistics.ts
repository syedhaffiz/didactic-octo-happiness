import { Router } from "express";
import {
  getFiscalYears,
  getHandlingRates,
  getOutstanding,
  getPda,
  getPdaPeriods,
  getVesselsSailed,
} from "../controllers/logisticsController.js";

const router = Router();

// One endpoint per card — no aggregate overview.
router.get("/vessels-sailed", getVesselsSailed);
// Fiscal-year list for the Handling Rates dropdown; the card passes the chosen
// year (e.g. ?year=2025-26) to /handling-rates.
router.get("/fiscal-year", getFiscalYears);
router.get("/handling-rates", getHandlingRates);
// Portwise PDA table; the card passes the chosen half-year (e.g. ?period=2025-26-H1).
router.get("/pda", getPda);
// Fiscal-year-half list for the PDA card's period dropdown.
router.get("/pda/periods", getPdaPeriods);
router.get("/outstanding", getOutstanding);

export default router;
