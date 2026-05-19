import { Router } from "express";
import { ok } from "../types/api.js";

const router = Router();

router.get("/", (_req, res) => {
  res.json(ok({ status: "ok", uptime: process.uptime() }));
});

export default router;
