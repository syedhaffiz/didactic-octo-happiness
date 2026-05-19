import { Router } from "express";
import healthRouter from "./health.js";
import financeRouter from "./finance.js";
import filtersRouter from "./filters.js";

const router = Router();

router.use("/health", healthRouter);
router.use("/finance", financeRouter);
router.use("/filters", filtersRouter);

export default router;
