import { Router } from "express";
import {
  getCaseByNo,
  getCriticalCases,
  getCriticalIssues,
  getSummary,
} from "../controllers/legalController.js";

const router = Router();

router.get("/summary", getSummary);
router.get("/critical-cases", getCriticalCases);
// Per-case detail: /api/legal/critical-cases/EC%2F103%2F2022
router.get("/critical-cases/:caseNo", getCaseByNo);
router.get("/critical-issues", getCriticalIssues);

export default router;
