import type { KPI, IconKey } from "../types/finance.js";
import { monthsInRange, type MonthKey } from "./catalog.js";
import { intRange, range, round, seedFromString, seeded } from "./rand.js";

interface Definition {
  id: IconKey;
  label: string;
  unit: KPI["unit"];
  baseValue: number;
  variance: number; // ± fraction
  href: string;
}

const DEFINITIONS: readonly Definition[] = [
  { id: "revenue", label: "Revenue", unit: "Cr", baseValue: 970, variance: 0.18, href: "/finance/revenue" },
  { id: "sales", label: "Sales", unit: "MMT", baseValue: 5.1, variance: 0.22, href: "/finance/sales" },
  { id: "profitability", label: "Profitability", unit: "Cr", baseValue: 114, variance: 0.25, href: "/finance/profitability" },
  { id: "workingCapital", label: "Working Capital", unit: "Cr", baseValue: 970, variance: 0.18, href: "/finance/working-capital" },
  { id: "dispatch", label: "Dispatch", unit: "MMT", baseValue: 5.1, variance: 0.22, href: "/finance/dispatch" },
  { id: "inventoryDays", label: "Inventory Days", unit: "Days", baseValue: 24, variance: 0.15, href: "/finance/inventory-days" },
];

const aggregateValue = (def: Definition, months: MonthKey[]): number => {
  // Headline KPI represents the per-period value for the selected window — average across
  // months so a 1-month or 11-month range both produce a number close to baseValue, varying
  // by month seed but not scaling with the window length.
  let acc = 0;
  for (const m of months) {
    const rng = seeded(seedFromString(`${def.id}:${m.label}`));
    const factor = 1 + (rng() * 2 - 1) * def.variance;
    acc += def.baseValue * factor;
  }
  const value = acc / Math.max(months.length, 1);
  return round(value, def.unit === "MMT" ? 2 : def.unit === "Days" ? 0 : 1);
};

const buildSpark = (def: Definition, months: MonthKey[]): number[] =>
  months.map((m) => {
    const rng = seeded(seedFromString(`spark:${def.id}:${m.label}`));
    const factor = 1 + (rng() * 2 - 1) * def.variance;
    return round(def.baseValue * factor, def.unit === "MMT" ? 2 : def.unit === "Days" ? 0 : 0);
  });

const buildDelta = (def: Definition, months: MonthKey[]): number => {
  if (months.length < 2) {
    const rng = seeded(seedFromString(`delta:${def.id}:${months[0]?.label ?? "x"}`));
    return Math.round(range(rng, -15, 18));
  }
  const last = months[months.length - 1]!;
  const prev = months[months.length - 2]!;
  const rngLast = seeded(seedFromString(`spark:${def.id}:${last.label}`))();
  const rngPrev = seeded(seedFromString(`spark:${def.id}:${prev.label}`))();
  const lv = def.baseValue * (1 + (rngLast * 2 - 1) * def.variance);
  const pv = def.baseValue * (1 + (rngPrev * 2 - 1) * def.variance);
  return Math.round(((lv - pv) / pv) * 100);
};

export const buildKpis = (from: Date, to: Date): KPI[] => {
  const months = monthsInRange(from, to);
  return DEFINITIONS.map((def) => {
    const value = aggregateValue(def, months);
    const spark = buildSpark(def, months.length ? months : [{ year: 2025, month: 4, label: "2025-04" }]);
    const delta = buildDelta(def, months);
    return {
      id: def.id,
      label: def.label,
      unit: def.unit,
      value,
      spark,
      deltaPct: delta,
      trend: delta >= 0 ? "up" : "down",
      href: def.href,
    } satisfies KPI;
  });
};

// Suppress unused-import-style warnings when intRange is tree-shakable elsewhere.
void intRange;
