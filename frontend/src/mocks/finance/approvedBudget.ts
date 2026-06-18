// Mirror of backend/src/mocks/approvedBudget.ts. Kept in sync.

import type {
  ApprovedBudgetParams,
  ApprovedBudgetResponse,
  BudgetSeries,
  InventoryGauge,
  PbdRow,
} from "../../types/finance";
import { range, round, seedFromString, seeded } from "../rand";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Number of months Actual has data for (year-to-date).
const ACTUAL_HORIZON = 6;

const filterKey = (f: ApprovedBudgetParams, fy: string) =>
  `${fy}:${f.port ?? "ALL"}:${f.grade ?? "ALL"}:${f.zone ?? "ALL"}:${f.origin ?? "ALL"}`;

const buildSeries = (
  resource: "volume" | "margin",
  unit: "MT" | "Cr",
  f: ApprovedBudgetParams,
  fy: string,
): BudgetSeries => {
  const seed = seedFromString(`${resource}:${filterKey(f, fy)}`);
  const rng = seeded(seed);

  // Budget: smooth seasonal curve (rises mid-year, falls end-year).
  const budget = MONTHS.map((_, i) => {
    const phase = (i / 11) * Math.PI;
    const base = 18 + Math.sin(phase) * 22;
    const jitter = (rng() * 2 - 1) * 2.4;
    return round(base + jitter, 1);
  });

  // Actual: shorter run, smaller magnitude with occasional dip below zero.
  const actual = MONTHS.map((_, i) => {
    if (i >= ACTUAL_HORIZON) return null;
    const seasonal = (i / 11) * 10;
    const jitter = (rng() * 2 - 1) * 4;
    return round(Math.max(-4, seasonal - 2 + jitter), 1);
  });

  return { months: MONTHS, budget, actual, unit };
};

const PBD_PORTS = [
  "DAHEJ",
  "DHAMRA",
  "DHAMARTAR",
  "DIGH",
  "ENNORE",
  "GANGAVARAM",
  "GOA",
  "GOPALPUR",
  "HALDIA",
  "HAZIRA",
];

const buildPbd = (f: ApprovedBudgetParams, fy: string): PbdRow[] => {
  const seed = seedFromString(`pbd:${filterKey(f, fy)}`);
  const rng = seeded(seed);
  return PBD_PORTS.map((port) => ({ port, days: round(range(rng, -2, 2.5), 1) }));
};

const buildInventory = (f: ApprovedBudgetParams, fy: string): InventoryGauge => {
  const seed = seedFromString(`inventory:${filterKey(f, fy)}`);
  const rng = seeded(seed);
  const seb = round(range(rng, 2, 8));
  const sns = round(range(rng, 22, 32));
  return {
    max: 35,
    slices: [
      { segment: "SEB", days: seb },
      { segment: "SNS", days: sns },
    ],
  };
};

export const buildApprovedBudget = (
  filters: ApprovedBudgetParams = {},
): ApprovedBudgetResponse => {
  const fy = filters.fy ?? "FY26";
  return {
    fy,
    volume: buildSeries("volume", "MT", filters, fy),
    margin: buildSeries("margin", "Cr", filters, fy),
    pbd: buildPbd(filters, fy),
    inventory: buildInventory(filters, fy),
  };
};
