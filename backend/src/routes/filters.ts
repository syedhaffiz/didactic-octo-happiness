import { Router } from "express";
import {
  getGrades,
  getOrigins,
  getPorts,
  getSegments,
  getZones,
} from "../controllers/filtersController.js";

const router = Router();

router.get("/ports", getPorts);
router.get("/segments", getSegments);
router.get("/zones", getZones);
router.get("/grades", getGrades);
router.get("/origins", getOrigins);

export default router;
