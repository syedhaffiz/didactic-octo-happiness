import { Router } from "express";
import healthRouter from "./health.js";
import financeRouter from "./finance.js";
import filtersRouter from "./filters.js";
import inventoryRouter from "./inventory.js";
import marketingRouter from "./marketing.js";
import legalRouter from "./legal.js";
import logisticsRouter from "./logistics.js";

const router = Router();

router.use("/health", healthRouter);
router.use("/finance", financeRouter);
router.use("/filters", filtersRouter);
router.use("/inventory", inventoryRouter);
router.use("/marketing", marketingRouter);
router.use("/legal", legalRouter);
router.use("/logistics", logisticsRouter);

export default router;
