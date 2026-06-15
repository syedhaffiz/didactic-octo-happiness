import { Router } from "express";
import {
  getCriticalCases,
  getCriticalIssues,
  getSummary,
} from "../controllers/legalController.js";

const router = Router();

router.get("/summary", getSummary);
router.get("/critical-cases", getCriticalCases);
router.get("/critical-issues", getCriticalIssues);

export default router;
