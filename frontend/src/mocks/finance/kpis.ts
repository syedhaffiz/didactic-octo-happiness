// Mirror of backend/src/mocks/kpis.ts. Kept in sync.

import type { KPI, IconKey } from "../../types/finance";
import { MONTHS, monthsInRange, type MonthKey } from "../catalog";
import { round, seedFromString, seeded } from "../rand";
import { parseRange } from "../dateRange";

interface Definition {
  id: IconKey;
  label: string;
  unit: KPI["unit"];
  value: number;
  deltaPct: number;
  href: string;
}

const DEFINITIONS: readonly Definition[] = [
  { id: "revenue",        label: "Revenue",         unit: "Cr",   value: 970, deltaPct: 12, href: "/finance/revenue" },
  { id: "sales",          label: "Sales",           unit: "MMT",  value: 5.1, deltaPct: -7, href: "/finance/sales" },
  { id: "profitability",  label: "Profitability",   unit: "Cr",   value: 114, deltaPct: 8,  href: "/finance/profitability" },
  { id: "workingCapital", label: "Working Capital", unit: "Cr",   value: 970, deltaPct: 12, href: "/finance/working-capital" },
  { id: "inventoryDays",  label: "Inventory Days",  unit: "Days", value: 24,  deltaPct: 12, href: "/finance/inventory-days" },
];

const buildSpark = (def: Definition, months: MonthKey[]): number[] => {
  // Use the matching months when available; otherwise fall back to the full
  // 11-month catalogue so the spark always has enough points to draw a curve
  // (Highcharts areaspline with <2 points renders empty).
  const samples = months.length >= 2 ? months : MONTHS;
  return samples.map((m) => {
    const rng = seeded(seedFromString(`spark:${def.id}:${m.label}`));
    const factor = 1 + (rng() * 2 - 1) * 0.15;
    return round(def.value * factor, def.unit === "MMT" ? 2 : def.unit === "Days" ? 0 : 0);
  });
};

export const buildKpis = (fromDate?: string, toDate?: string): KPI[] => {
  const { from, to } = parseRange(fromDate, toDate);
  const months = monthsInRange(from, to);
  return DEFINITIONS.map((def) => ({
    id: def.id,
    label: def.label,
    unit: def.unit,
    value: def.value,
    spark: buildSpark(def, months),
    deltaPct: def.deltaPct,
    trend: def.deltaPct >= 0 ? "up" : "down",
    href: def.href,
  } satisfies KPI));
};
