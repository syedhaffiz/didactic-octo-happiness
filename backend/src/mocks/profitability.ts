// Mocks for the new Profitability suite:
//   1) Net Margin Profitability   — port chart + total + segment treemap
//   2) Vessel Profitability       — Sales / Handling tables (separate endpoints)
//   3) Batch ID drilldown         — Sales / Handling detail tables

import type {
  BatchDetailSearch,
  BatchSummary,
  Currency,
  HandlingBatchDetailResponse,
  HandlingBatchDetailRow,
  HandlingCategory,
  NetMarginProfitabilityResponse,
  ProfitabilityPortRow,
  ProfitabilitySegmentItem,
  SalesBatchDetailResponse,
  SalesBatchDetailRow,
  VesselHandlingResponse,
  VesselHandlingRow,
  VesselHandlingSearch,
  VesselSalesResponse,
  VesselSalesRow,
  VesselSalesSearch,
  VesselSummary,
} from "../types/finance.js";
import {
  COAL_GRADES,
  GRADES,
  ORIGINS,
  PORTS,
  PORT_LIST,
  PROFIT_CENTRES,
  SEGMENTS,
  VESSELS,
  monthsInRange,
  type MonthKey,
} from "./catalog.js";
import { pick, range, round, seedFromString, seeded } from "./rand.js";

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
  currency: Currency,
  from: Date,
  to: Date,
): NetMarginProfitabilityResponse => {
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

// --- Vessel Profitability — shared row basis -------------------------------

const VESSEL_BATCH_PREFIX = "125260";
const SALES_SEGMENTS = ["SEB", "Domestic", "SNS", "TPH", "CIF Handling"] as const;
const ROW_COUNT = 18;

// Power / steel / cement offtakers on the Handling tables.
const CUSTOMERS = [
  "Tata Power",
  "NTPC Ltd",
  "JSW Energy",
  "Reliance Ind.",
  "Torrent Power",
  "GMR Energy",
  "CESC Ltd",
  "Essar Power",
  "India Cements",
  "Vedanta Ltd",
  "Hindalco Ind.",
  "BHEL",
  "SAIL",
] as const;

const batchIdForIdx = (idx: number): string =>
  `${VESSEL_BATCH_PREFIX}${(503 + (idx % 9)).toString().padStart(3, "0")}A`;

// Seed the row set off the selected months so the tables respond to the range
// filter while staying stable across reloads.
const monthSeed = (prefix: string, from: Date, to: Date): (() => number) => {
  const months = monthsInRange(from, to);
  const ms = months.length ? months : [{ year: 2025, month: 4, label: "2025-04" } as MonthKey];
  return seeded(seedFromString(`${prefix}:${ms.map((m) => m.label).join(",")}`));
};

// Per-MT figures are the primitive: profit and revenue are derived from them so
// a row's Profit / MT always equals Profit ÷ Volume, as the column name implies.
interface RowBasis {
  volume: number;
  revPerMt: number;
  revenue: number;
  pmtProfit: number;
  profit: number;
}

const buildRowBasis = (rng: () => number): RowBasis => {
  const volume = Math.round(range(rng, 2500, 4800));
  const revPerMt = round(range(rng, 3_500, 5_200), 2); // ₹ / MT
  const pmtProfit = round(range(rng, 300, 1_500), 2); // ₹ / MT
  return {
    volume,
    revPerMt,
    revenue: Math.round(volume * revPerMt),
    pmtProfit,
    profit: Math.round(volume * pmtProfit),
  };
};

// Totals for the four stat tiles, summed over the FULL row set (before the
// search filter) so the KPIs stay put while a search only narrows the table.
const summarise = (
  rows: readonly { vessel: string; volume: number; profit: number }[],
  revenue: number,
): VesselSummary => ({
  revenue,
  totalProfit: rows.reduce((s, r) => s + r.profit, 0),
  totalVessels: new Set(rows.map((r) => r.vessel)).size,
  totalVolume: rows.reduce((s, r) => s + r.volume, 0),
});

// Case-insensitive substring match; an empty / missing term matches everything.
const matchesTerm = (value: string, term: string | undefined): boolean =>
  !term || value.toLowerCase().includes(term.toLowerCase());

// --- Vessel Profitability — Sales tab -------------------------------------

export const buildVesselSales = (
  currency: Currency,
  from: Date,
  to: Date,
  search: VesselSalesSearch = {},
): VesselSalesResponse => {
  const rng = monthSeed("vessel-sales", from, to);
  const rate = currency === "USD" ? USD_PER_INR : 1;
  const bases = Array.from({ length: ROW_COUNT }, () => buildRowBasis(rng));

  const allItems = bases.map((basis, idx) => ({
    batchId: batchIdForIdx(idx),
    vessel: pick(rng, VESSELS),
    segment: SALES_SEGMENTS[idx % SALES_SEGMENTS.length] ?? "SEB",
    volume: basis.volume,
    revenue: Math.round(basis.revenue * rate),
    revPerMt: round(basis.revPerMt * rate, 2),
    profit: Math.round(basis.profit * rate),
    profitPerMt: round(basis.pmtProfit * rate, 2),
    // Always USD — a column of its own, unaffected by the toggle.
    profitPerMtUsd: round(basis.pmtProfit * USD_PER_INR, 2),
  } satisfies VesselSalesRow));

  // Summary is over the full set; the search only narrows the returned rows.
  const revenue = allItems.reduce((s, r) => s + r.revenue, 0);
  const items = allItems.filter(
    (r) =>
      matchesTerm(r.batchId, search.batchId) &&
      matchesTerm(r.vessel, search.vessel) &&
      matchesTerm(r.segment, search.segment),
  );

  return {
    currency,
    summary: summarise(allItems, revenue),
    total: allItems.length,
    items,
  };
};

// --- Vessel Profitability — Handling tab ----------------------------------

// Each sub-tab is its own seeded row set, so switching category visibly changes
// the data the way a real category filter would.
export const buildVesselHandling = (
  category: HandlingCategory,
  currency: Currency,
  from: Date,
  to: Date,
  search: VesselHandlingSearch = {},
): VesselHandlingResponse => {
  const rng = monthSeed(`vessel-handling:${category}`, from, to);
  const rate = currency === "USD" ? USD_PER_INR : 1;
  const bases = Array.from({ length: ROW_COUNT }, () => buildRowBasis(rng));

  const allItems = bases.map((basis, idx) => ({
    batchId: batchIdForIdx(idx),
    vessel: pick(rng, VESSELS),
    customer: CUSTOMERS[idx % CUSTOMERS.length] ?? CUSTOMERS[0],
    port: pick(rng, PORTS),
    volume: basis.volume,
    profit: Math.round(basis.profit * rate),
    pmtProfit: round(basis.pmtProfit * rate, 2),
  } satisfies VesselHandlingRow));

  // Handling has no Revenue column, but the tile above the table still shows it
  // — take it from the same row basis so the two stay consistent.
  const revenue = Math.round(bases.reduce((s, b) => s + b.revenue, 0) * rate);
  // Summary is over the full set; the search only narrows the returned rows.
  const items = allItems.filter(
    (r) =>
      matchesTerm(r.batchId, search.batchId) &&
      matchesTerm(r.vessel, search.vessel) &&
      matchesTerm(r.customer, search.customer) &&
      matchesTerm(r.port, search.port),
  );

  return {
    currency,
    category,
    summary: summarise(allItems, revenue),
    total: allItems.length,
    items,
  };
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

// The six stat tiles above a batch-detail table. Volume is in MT; the cost lines
// are rupee amounts, sized so they land in the crore range the design shows.
const buildBatchSummary = (rng: () => number): BatchSummary => ({
  totalVolume: Math.round(range(rng, 45_000, 90_000)),
  profit: Math.round(range(rng, 2.4e8, 9.6e8)),
  roadFreight: Math.round(range(rng, 4e7, 1.8e8)),
  railwayFreight: Math.round(range(rng, 6e7, 2.4e8)),
  demurrage: Math.round(range(rng, 8e6, 4.5e7)),
  penalty: Math.round(range(rng, 2e6, 1.8e7)),
});

// Both batch-detail tables search on the same four text columns; matching each
// row's fields against the search terms is shared.
const matchesBatchRow = (
  row: { batchId: string; customerName: string; plantName: string; tradeContractNo: string },
  search: BatchDetailSearch,
): boolean =>
  matchesTerm(row.batchId, search.batchId) &&
  matchesTerm(row.customerName, search.customerName) &&
  matchesTerm(row.plantName, search.plantName) &&
  matchesTerm(row.tradeContractNo, search.tradeContractNo);

export const buildSalesBatchDetail = (
  batchId: string,
  search: BatchDetailSearch = {},
): SalesBatchDetailResponse => {
  const rng = seeded(seedFromString(`sales-batch-detail:${batchId}`));
  const summary = buildBatchSummary(rng);
  const allItems = Array.from({ length: 14 }, (_, idx) => ({
    batchId: batchIdForIdx(idx),
    customerName: CUSTOMER_NAMES[idx % CUSTOMER_NAMES.length] ?? CUSTOMER_NAMES[0]!,
    plantName: buildPlantName(rng, idx),
    tradeContractNo: buildTradeContractNo(rng),
    billAmount: round(range(rng, 5_000_000, 75_000_000), 0),
    billQuantity: round(range(rng, -8_000_000, 8_000_000), 0),
    cogsValue: round(range(rng, 50_000_000, 250_000_000), 0),
  } satisfies SalesBatchDetailRow));
  void COAL_GRADES; void GRADES; void SEGMENTS; void ORIGINS;
  // Summary is over the full set; the search only narrows the returned rows.
  const items = allItems.filter((r) => matchesBatchRow(r, search));
  return { batchId, summary, total: allItems.length, items };
};

// --- Handling batch detail ------------------------------------------------

export const buildHandlingBatchDetail = (
  batchId: string,
  search: BatchDetailSearch = {},
): HandlingBatchDetailResponse => {
  const rng = seeded(seedFromString(`handling-batch-detail:${batchId}`));
  const summary = buildBatchSummary(rng);
  const allItems = Array.from({ length: 14 }, (_, idx) => ({
    batchId: batchIdForIdx(idx),
    customerName: CUSTOMER_NAMES[idx % CUSTOMER_NAMES.length] ?? CUSTOMER_NAMES[0]!,
    plantName: buildPlantName(rng, idx),
    tradeContractNo: buildTradeContractNo(rng),
    tphCifCoalHandlingQty: Math.round(range(rng, -45_000_000, -1_000_000)),
    tphCoalHandlingQty: Math.round(range(rng, -45_000_000, -1_000_000)),
    sagarmalaHandlingCalculatedQty: Math.round(range(rng, -25_000_000, -1_000_000)),
    sagarmalaHandlingPostedQty: Math.round(range(rng, -25_000_000, -1_000_000)),
  } satisfies HandlingBatchDetailRow));
  // Summary is over the full set; the search only narrows the returned rows.
  const items = allItems.filter((r) => matchesBatchRow(r, search));
  return { batchId, summary, total: allItems.length, items };
};
