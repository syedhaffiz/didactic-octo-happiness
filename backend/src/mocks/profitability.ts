import type {
  ProfitabilityBar,
  ProfitabilityResponse,
  VesselRow,
} from "../types/finance.js";
import {
  GRADES,
  ORIGINS,
  PORTS,
  SEGMENTS,
  VESSELS,
  monthsInRange,
  type MonthKey,
} from "./catalog.js";
import { pick, range, round, seedFromString, seeded } from "./rand.js";

const PORT_CHART_SET = ["DAHEJ", "DHAMRA", "DHAMARTBP", "GOPI", "GANGAVARAM", "KRISHNAPATNAM", "MUNDRA", "SAGARMALA", "GOPALPUR", "PARADIP", "HAZIRA"];
const SEGMENT_CHART_SET = ["TPH", "SNS", "SEB", "Sagarmala", "Old"];

const buildChart = (
  mode: "port" | "segment",
  filter: string | undefined,
  months: MonthKey[],
): ProfitabilityBar[] => {
  const categories = mode === "port" ? PORT_CHART_SET : SEGMENT_CHART_SET;
  return categories.map((cat) => {
    let acc = 0;
    for (const m of months) {
      const rng = seeded(seedFromString(`profit:${mode}:${cat}:${filter ?? "ALL"}:${m.label}`));
      acc += range(rng, 200, 950);
    }
    return { category: cat, value: round(acc / Math.max(months.length, 1)) };
  });
};

const VESSEL_BATCH_PREFIX = "125260";

const buildVessels = (
  mode: "port" | "segment",
  filter: string | undefined,
  months: MonthKey[],
  rows = 18,
): VesselRow[] => {
  const rng = seeded(seedFromString(`vessels:${mode}:${filter ?? "ALL"}:${months.map((m) => m.label).join(",")}`));
  return Array.from({ length: rows }, (_, idx) => {
    const vessel = pick(rng, VESSELS);
    const grade = pick(rng, GRADES);
    const origin = pick(rng, ORIGINS);
    const port = mode === "port" && filter ? filter : pick(rng, PORTS);
    const segment = mode === "segment" && filter ? filter : pick(rng, SEGMENTS);
    const profit = round(range(rng, -25_000_000, 8_500_000), 2);
    return {
      batchId: `${VESSEL_BATCH_PREFIX}${(503 + (idx % 9)).toString().padStart(3, "0")}A`,
      vessel,
      grade,
      origin,
      port,
      segment,
      profit,
    };
  });
};

export const buildProfitability = (
  mode: "port" | "segment",
  filter: string | undefined,
  from: Date,
  to: Date,
): ProfitabilityResponse => {
  const months = monthsInRange(from, to);
  return {
    mode,
    chart: buildChart(mode, filter, months.length ? months : [{ year: 2025, month: 4, label: "2025-04" }]),
    vessels: buildVessels(mode, filter, months.length ? months : [{ year: 2025, month: 4, label: "2025-04" }]),
  };
};
