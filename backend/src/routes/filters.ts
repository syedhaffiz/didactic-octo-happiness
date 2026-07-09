import { Router } from "express";
import { getAll, getPortsByZone } from "../controllers/filtersController.js";

const router = Router();

// Single endpoint that returns every reference list the UI needs. The
// payload is small (a few dozen strings total), so batching is much
// cheaper than five round-trips on page mount.
router.get("/", getAll);

// Zone-dependent port list — the Revenue Port dropdown loads this once a
// concrete zone is picked.
router.get("/ports", getPortsByZone);

export default router;
