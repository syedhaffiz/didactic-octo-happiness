// Mirror of backend/src/mocks/profitability.ts (the new Profitability suite).
// Kept in sync. Replaces the old port/segment-toggle mock.

import type {
  Currency,
  HandlingBatchDetailResponse,
  HandlingBatchDetailRow,
  NetMarginProfitabilityResponse,
  PortBar,
  SalesBatchDetailResponse,
  SalesBatchDetailRow,
  SegmentSlice,
  VesselHandlingResponse,
  VesselHandlingRow,
  VesselSalesResponse,
  VesselSalesRow,
} from "../../types/finance";
import {
  ORIGINS,
  PROFIT_CENTRES,
  VESSELS,
  monthsInRange,
  type MonthKey,
} from "../catalog";
import { pick, range, round, seedFromString, seeded } from "../rand";
import { parseRange } from "../dateRange";

// --- Net Margin Profitability ---------------------------------------------

const PORT_CHART_SET = [
  "Mundra",
  "PAHD",
  "Bedi",
  "Paradip",
  "Talabira",
  "Dahej",
  "Navlakhi",
  "Dhamra",
  "Dharamtar",
  "Gangavaram",
  "Goa",
  "Gopalpur",
  "Haldia",
  "Hazira",
  "Kakinada",
  "Karaikal",
  "Krishnapatnam",
];

const SEGMENT_TREEMAP_SET = ["SNS", "SEB", "Sagarmala", "Old", "TPH"];

const buildPortwise = (port: string | undefined, currency: Currency, months: MonthKey[]): PortBar[] =>
  PORT_CHART_SET
    .filter((p) => !port || p.toLowerCase() === port.toLowerCase())
    .map((p) => {
      let acc = 0;
      for (const m of months) {
        const rng = seeded(seedFromString(`portwise:${currency}:${p}:${m.label}`));
        acc += range(rng, 0.1, 0.8);
      }
      return {
        port: p,
        value: round(acc / Math.max(months.length, 1), 1),
      };
    });

const buildSegmentwise = (months: MonthKey[]): SegmentSlice[] =>
  SEGMENT_TREEMAP_SET.map((segment) => {
    let acc = 0;
    for (const m of months) {
      const rng = seeded(seedFromString(`segmentwise:${segment}:${m.label}`));
      acc += range(rng, 30000, 60000);
    }
    return {
      segment,
      value: Math.round(acc / Math.max(months.length, 1)),
    };
  });

export const buildNetMarginProfitability = (
  port: string | undefined,
  currency: Currency = "INR",
  fromDate?: string,
  toDate?: string,
): NetMarginProfitabilityResponse => {
  const { from, to } = parseRange(fromDate, toDate);
  const months = monthsInRange(from, to);
  const ms = months.length ? months : [{ year: 2025, month: 4, label: "2025-04" } as MonthKey];
  return {
    total: { value: 114, unit: "Cr", deltaPct: 8, trend: "up" },
    portwise: { currency, rows: buildPortwise(port, currency, ms) },
    segmentwise: buildSegmentwise(ms),
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
