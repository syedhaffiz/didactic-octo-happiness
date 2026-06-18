// Mirror of backend/src/mocks/sales.ts. Kept in sync.

import type { BudgetActualRow, SalesResponse } from "../../types/finance";
import { PORTS, SEGMENTS, ZONES, monthsInRange, type MonthKey } from "../catalog";
import { round, seedFromString, seeded } from "../rand";
import { parseRange } from "../dateRange";

const accumulate = (
  bucket: string,
  scope: "port" | "zone" | "segment",
  unit: "MMT" | "MT",
  months: MonthKey[],
): BudgetActualRow => {
  const baseBudget = scope === "port" ? 0.6 : scope === "zone" ? 280 : 220;
  const variance = 0.45;

  let budget = 0;
  let actual = 0;
  for (const m of months) {
    const rngB = seeded(seedFromString(`sales:${scope}:budget:${bucket}:${m.label}`));
    const rngA = seeded(seedFromString(`sales:${scope}:actual:${bucket}:${m.label}`));
    budget += baseBudget * (1 + (rngB() * 2 - 1) * variance);
    actual += baseBudget * (1 + (rngA() * 2 - 1) * variance) * (0.6 + rngA() * 0.7);
  }
  return {
    category: bucket,
    budget: round(budget / Math.max(months.length, 1), unit === "MMT" ? 2 : 0),
    actual: round(actual / Math.max(months.length, 1), unit === "MMT" ? 2 : 0),
    unit,
  };
};

export const buildSales = (fromDate?: string, toDate?: string): SalesResponse => {
  const { from, to } = parseRange(fromDate, toDate);
  const months = monthsInRange(from, to);
  const ms = months.length ? months : [{ year: 2025, month: 4, label: "2025-04" } as MonthKey];

  const portwise = PORTS.map((p) => accumulate(p, "port", "MMT", ms));
  // Zonewise + segmentwise scale up to "1000 metric tons (MT)" axis like the Figma.
  const zonewise = ZONES.map((z) => {
    const r = accumulate(z, "zone", "MT", ms);
    return { ...r, budget: Math.round(r.budget * 1000), actual: Math.round(r.actual * 1000) };
  });
  const segmentwise = SEGMENTS.map((s) => {
    const r = accumulate(s, "segment", "MT", ms);
    return { ...r, budget: Math.round(r.budget * 1000), actual: Math.round(r.actual * 1000) };
  });

  return { portwise, zonewise, segmentwise };
};
