import { Router } from "express";
import { getPorts, getSegments, getZones } from "../controllers/filtersController.js";

const router = Router();

router.get("/ports", getPorts);
router.get("/segments", getSegments);
router.get("/zones", getZones);

export default router;
