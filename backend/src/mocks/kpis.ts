import type { KPI, IconKey } from "../types/finance.js";
import { MONTHS, monthsInRange, type MonthKey } from "./catalog.js";
import { round, seedFromString, seeded } from "./rand.js";

// Headline KPI display + value config. Pinned to the Figma overview's exact
// numbers so the dashboard reads the same as the design out of the box. Only
// the per-month spark values vary by date range (seeded for stability).
interface Definition {
  id: IconKey;
  label: string;
  unit: KPI["unit"];
  /** Fixed headline value shown on the card (matches the Figma). */
  value: number;
  /** Fixed delta %, signed; trend follows the sign. */
  deltaPct: number;
  href: string;
}

const DEFINITIONS: readonly Definition[] = [
  { id: "revenue",        label: "Revenue",        unit: "Cr",   value: 970, deltaPct: 12, href: "/finance/overview/revenue" },
  { id: "sales",          label: "Sales",          unit: "MMT",  value: 5.1, deltaPct: -7, href: "/finance/sales" },
  { id: "profitability",  label: "Profitability",  unit: "Cr",   value: 114, deltaPct: 8,  href: "/finance/overview/profitability" },
  { id: "workingCapital", label: "Working Capital",unit: "Cr",   value: 970, deltaPct: 12, href: "/finance/working-capital" },
  { id: "inventoryDays",  label: "Inventory Days", unit: "Days", value: 24,  deltaPct: 12, href: "/finance/inventory-days" },
];

// Spark is a small wave around the headline value, seeded so it doesn't
// reshuffle between renders. Range only affects the spark sampling, not the
// headline (kept fixed for the dashboard's at-a-glance read). Falls back to
// the full 11-month catalogue when the range matches fewer than 2 catalog
// months, so the spark always has enough points to draw a curve (Highcharts
// areaspline with <2 points renders empty).
const buildSpark = (def: Definition, months: MonthKey[]): number[] => {
  const samples = months.length >= 2 ? months : MONTHS;
  return samples.map((m) => {
    const rng = seeded(seedFromString(`spark:${def.id}:${m.label}`));
    // ±15% wave around the headline value for a believable trend line.
    const factor = 1 + (rng() * 2 - 1) * 0.15;
    return round(def.value * factor, def.unit === "MMT" ? 2 : def.unit === "Days" ? 0 : 0);
  });
};

export const buildKpis = (from: Date, to: Date): KPI[] => {
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
