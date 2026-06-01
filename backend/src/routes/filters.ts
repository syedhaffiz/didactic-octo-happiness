import { Router } from "express";
import { getAll } from "../controllers/filtersController.js";

const router = Router();

// Single endpoint that returns every reference list the UI needs. The
// payload is small (a few dozen strings total), so batching is much
// cheaper than five round-trips on page mount.
router.get("/", getAll);

export default router;
