// Mirror of backend/src/mocks/profitability.ts (the new Profitability suite).
// Kept in sync. Replaces the old port/segment-toggle mock.

import type {
  Currency,
  HandlingBatchDetailResponse,
  HandlingBatchDetailRow,
  NetMarginProfitabilityResponse,
  ProfitabilityPortRow,
  ProfitabilitySegmentItem,
  SalesBatchDetailResponse,
  SalesBatchDetailRow,
  VesselHandlingResponse,
  VesselHandlingRow,
  VesselSalesResponse,
  VesselSalesRow,
} from "../../types/finance";
import {
  ORIGINS,
  PORT_LIST,
  PROFIT_CENTRES,
  VESSELS,
  monthsInRange,
  type MonthKey,
} from "../catalog";
import { pick, range, round, seedFromString, seeded } from "../rand";
import { parseRange } from "../dateRange";

// --- Net Margin Profitability ---------------------------------------------

// Segment order pinned to the Figma legend (SNS / SEB / TPH / Sagarmala) so the
// donut colors line up. Baseline per-segment profit for a ~1-month window as
// whole-number rupee amounts; the UI formats each as Cr / L. The date range and
// zone filter scale these.
const SEGMENTS_ORDER = ["SNS", "SEB", "TPH", "Sagarmala"] as const;

const SEGMENT_BASELINE: Record<string, number> = {
  SNS: 866_000_000, // 86.6 Cr
  SEB: 612_000_000, // 61.2 Cr
  TPH: 336_000_000, // 33.6 Cr
  Sagarmala: 174_000_000, // 17.4 Cr
};

const DAY_MS = 86_400_000;

// Indicative INR→USD rate for the currency toggle. The real API would apply the
// booked rate; the mock just divides so USD figures land in a plausible range.
const USD_PER_INR = 1 / 83;

const buildSegmentwise = (
  factor: number,
  filterScale: number,
  toBase: (rupees: number) => number,
  rng: () => number,
): ProfitabilitySegmentItem[] => {
  const items = SEGMENTS_ORDER.map((segment) => ({
    segment,
    value: toBase((SEGMENT_BASELINE[segment] ?? 0) * factor * filterScale),
    pct: 0,
    deltaVsBudget: round(5 + rng() * 13, 0), // +5 – +18
  }));
  const total = items.reduce((s, it) => s + it.value, 0);
  for (const it of items) it.pct = total > 0 ? round((it.value / total) * 100, 1) : 0;
  return items;
};

// Port Wise budget-vs-actual bars. Budget is seeded per port (stable across
// reloads); actual is a tight ±5% swing around it, matching the Figma where the
// two bars sit nearly level.
const buildPortwise = (
  factor: number,
  filterScale: number,
  toBase: (rupees: number) => number,
): ProfitabilityPortRow[] =>
  PORT_LIST.map((p) => {
    const prng = seeded(seedFromString(`profit:portwise:${p.id}`));
    const budget = range(prng, 8e11, 7.2e12) * factor * filterScale;
    const actual = budget * (0.95 + prng() * 0.1);
    return { port: p.name, budget: toBase(budget), actual: toBase(actual) };
  });

export const buildNetMarginProfitability = (
  zone: string | undefined,
  currency: Currency = "INR",
  fromDate?: string,
  toDate?: string,
): NetMarginProfitabilityResponse => {
  const { from, to } = parseRange(fromDate, toDate);
  // Scale the baselines by the selected window (relative to 30 days) so the view
  // responds to the date-range filter.
  const days = Math.max(1, Math.round((to.getTime() - from.getTime()) / DAY_MS));
  const factor = days / 30;

  // "all" (or missing) means the whole book — normalise it away so it doesn't
  // act as a concrete zone value.
  const zoneKey = zone && zone !== "all" ? zone : undefined;

  // Zone nudges the figures so the view visibly responds to the filter (seeded,
  // so a given zone is stable across reloads).
  const rng = seeded(seedFromString(`profit:${zoneKey ?? "all"}`));
  const filterScale = 0.75 + rng() * 0.5; // 0.75 – 1.25
  const rate = currency === "USD" ? USD_PER_INR : 1;
  const toBase = (rupees: number) => Math.round(rupees * rate);

  return {
    currency,
    total: {
      value: toBase(1_140_000_000 * factor * filterScale), // ~114 Cr baseline
      deltaVsBudget: round(8 + rng() * 8, 0), // +8 – +16
      deltaVsLastYear: -round(4 + rng() * 8, 0), // -4 – -12
    },
    segmentwise: buildSegmentwise(factor, filterScale, toBase, rng),
    portwise: buildPortwise(factor, filterScale, toBase),
  };
};

// --- Vessel Profitability — Sales tab -------------------------------------

const VESSEL_BATCH_PREFIX = "125260";
const SALES_SEGMENTS = ["SEB", "Domestic", "SNS", "TPH", "CIF Handling"] as const;

const batchIdForIdx = (idx: number): string =>
  `${VESSEL_BATCH_PREFIX}${(503 + (idx % 9)).toString().padStart(3, "0")}A`;

export const buildVesselSales = (
  port: string | undefined,
  fromDate?: string,
  toDate?: string,
): VesselSalesResponse => {
  const { from, to } = parseRange(fromDate, toDate);
  const months = monthsInRange(from, to);
  const ms = months.length ? months : [{ year: 2025, month: 4, label: "2025-04" } as MonthKey];
  const rng = seeded(seedFromString(`vessel-sales:${port ?? "ALL"}:${ms.map((m) => m.label).join(",")}`));
  const items = Array.from({ length: 18 }, (_, idx) => ({
    batchId: batchIdForIdx(idx),
    vessel: pick(rng, VESSELS),
    segment: SALES_SEGMENTS[idx % SALES_SEGMENTS.length] ?? "SEB",
    volume: Math.round(range(rng, 2500, 4800)),
    profit: Math.round(range(rng, 15_000, 45_000)),
    pmtProfit: Math.round(range(rng, 2_000, 9_500)),
  } satisfies VesselSalesRow));
  return { items };
};

// --- Vessel Profitability — Handling tab ----------------------------------

const HANDLING_GRADES = ["INDO-4200 GAR", "INDO-3400 GAR", "INDO-4800 GAR", "INDO-3800 GAR"] as const;

export const buildVesselHandling = (
  port: string | undefined,
  fromDate?: string,
  toDate?: string,
): VesselHandlingResponse => {
  const { from, to } = parseRange(fromDate, toDate);
  const months = monthsInRange(from, to);
  const ms = months.length ? months : [{ year: 2025, month: 4, label: "2025-04" } as MonthKey];
  const rng = seeded(seedFromString(`vessel-handling:${port ?? "ALL"}:${ms.map((m) => m.label).join(",")}`));
  const items = Array.from({ length: 18 }, (_, idx) => ({
    batchId: batchIdForIdx(idx),
    vessel: pick(rng, VESSELS),
    grade: HANDLING_GRADES[idx % HANDLING_GRADES.length] ?? "INDO-4200 GAR",
    origin: pick(rng, ORIGINS),
    port: port ?? "Hazira",
    segment: SALES_SEGMENTS[idx % SALES_SEGMENTS.length] ?? "SEB",
    volume: Math.round(range(rng, 2500, 4800)),
    profit: Math.round(range(rng, 15_000, 45_000)),
    pmtProfit: Math.round(range(rng, 2_000, 9_500)),
  } satisfies VesselHandlingRow));
  return { items };
};

// --- Sales batch detail ---------------------------------------------------

const CUSTOMER_NAMES = [
  "AEL-MUNDRA-EXBOND",
  "AEL-GANGAVARAM-EXBON",
  "AEL-KRISHNAPATNAM-EX",
  "AEL-HAZIRA-EXBOND",
  "AEL-DHAMRA-EXBOND",
  "AEL-PARADIP-EXBOND",
] as const;

const buildPlantName = (rng: () => number, idx: number): string =>
  PROFIT_CENTRES[idx % PROFIT_CENTRES.length] ?? pick(rng, PROFIT_CENTRES);

const buildTradeContractNo = (rng: () => number): string =>
  String(Math.round(range(rng, 12_000_000, 14_000_000)));

export const buildSalesBatchDetail = (batchId: string): SalesBatchDetailResponse => {
  const rng = seeded(seedFromString(`sales-batch-detail:${batchId}`));
  const items = Array.from({ length: 14 }, (_, idx) => ({
    batchId: batchIdForIdx(idx),
    customerName: CUSTOMER_NAMES[idx % CUSTOMER_NAMES.length] ?? CUSTOMER_NAMES[0]!,
    plantName: buildPlantName(rng, idx),
    tradeContractNo: buildTradeContractNo(rng),
    billAmount: round(range(rng, 5_000_000, 75_000_000), 0),
    billQuantity: round(range(rng, -8_000_000, 8_000_000), 0),
    cogsValue: round(range(rng, 50_000_000, 250_000_000), 0),
  } satisfies SalesBatchDetailRow));
  return { batchId, items };
};

// --- Handling batch detail ------------------------------------------------

export const buildHandlingBatchDetail = (batchId: string): HandlingBatchDetailResponse => {
  const rng = seeded(seedFromString(`handling-batch-detail:${batchId}`));
  const items = Array.from({ length: 14 }, (_, idx) => ({
    batchId: batchIdForIdx(idx),
    customerName: CUSTOMER_NAMES[idx % CUSTOMER_NAMES.length] ?? CUSTOMER_NAMES[0]!,
    plantName: buildPlantName(rng, idx),
    tradeContractNo: buildTradeContractNo(rng),
    tphCifCoalHandlingQty: Math.round(range(rng, -45_000_000, -1_000_000)),
    tphCoalHandlingQty: Math.round(range(rng, -45_000_000, -1_000_000)),
    sagarmalaHandlingCalculatedQty: Math.round(range(rng, -25_000_000, -1_000_000)),
    sagarmalaHandlingPostedQty: Math.round(range(rng, -25_000_000, -1_000_000)),
  } satisfies HandlingBatchDetailRow));
  return { batchId, items };
};
