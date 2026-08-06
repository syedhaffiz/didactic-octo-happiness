// Marketing module types. Mirrored in frontend/src/types/marketing.ts —
// kept manually in sync (a shared workspace is overkill at this scope).

import type { FilterRef } from "./api.js";

// Index Movement window — 1 Month or 2 Months. Stored as the digit so the
// URL param reads "1" / "2".
export type IndexRange = "1" | "2";

export type IndexCadence = "daily" | "weekly";

// --- Index Movement --------------------------------------------------------

export interface IndexSeries {
  name: string; // e.g. "ICI 1", "API 2"
  data: number[];
}

export interface IndexChart {
  code: string;        // URL slug, e.g. "ici", "api-daily", "api-weekly"
  title: string;       // display title, e.g. "ICI Index", "API Index"
  cadence: IndexCadence;
  range: IndexRange;
  categories: string[]; // x-axis labels — DD/MM/YY for daily, "DD/MM/YY - DD/MM/YY" for weekly
  series: IndexSeries[];
}

export interface IndexMovementResponse {
  items: IndexChart[];
}

// --- Market Share ----------------------------------------------------------
// Seven cards, each served from its own endpoint under /marketing/market-share.
// Every data endpoint accepts the shared MarketShareFilters query below.
//   split          : own vs non-own donut (aggregate MMT)
//   import-quantity: grouped bars per fiscal year
//   by-category    : grouped bars per business category (Trader / End-User / …)
//   quarterwise    : grouped bars, one group per quarter × fiscal year
//   industrywise   : grouped bars per industry
//   originwise     : grouped bars per origin country
//   portwise       : grouped bars per port
//
// `own` = the client's own volume; `nonOwn` = competitors. The brand-facing
// labels live only in the frontend display layer — these keys stay neutral.

// A grouped own/non-own bar row (one x-axis category, two columns).
export interface PairedBarRow {
  category: string;
  own: number;
  nonOwn: number;
}

// Quarterwise Import: one group per quarter (QTR-1..4), each with a paired row
// per fiscal year.
export interface QuarterGroup {
  quarter: string;
  rows: PairedBarRow[];
}

export interface MarketShareSplitResponse {
  unit: string; // "MMT"
  own: number;
  nonOwn: number;
  total: number;
}

// Shared response for the five simple grouped-bar cards (import-quantity,
// by-category, industrywise, originwise, portwise).
export interface MarketSharePairedResponse {
  unit: string;
  rows: PairedBarRow[];
}

export interface MarketShareQuarterwiseResponse {
  unit: string;
  groups: QuarterGroup[];
}

// Shared filter query for every Market Share data endpoint. `fiscalYears` and
// `quarters` are multiselect, arriving comma-joined (e.g. "FY24-25,FY25-26").
// The rest are single-select ids from the filter-options endpoint.
export interface MarketShareFilters {
  fiscalYears?: string;
  quarters?: string;
  share?: string;
  zone?: string;
  port?: string;
  origin?: string;
  segment?: string;
  addressable?: string;
  industry?: string;
  category?: string;
  shipperName?: string;
  receiverName?: string;
  fromDate?: string;
  toDate?: string;
}

// Dropdown option lists for the Filters side-panel. Quarter is a fixed frontend
// list (Q1–Q4), so it is intentionally absent here.
export interface MarketShareFilterOptions {
  fiscalYears: FilterRef[];
  shares: FilterRef[];
  zones: FilterRef[];
  ports: FilterRef[];
  origins: FilterRef[];
  segments: FilterRef[];
  addressable: FilterRef[];
  industries: FilterRef[];
  categories: FilterRef[];
  shipperNames: FilterRef[];
  receiverNames: FilterRef[];
}

// --- Ocean Freight ---------------------------------------------------------

export interface FreightSeries {
  name: string; // e.g. "Samarinda"
  data: number[];
}

export interface FreightChart {
  vesselType: string; // "Capes" | "Panamax"
  unit: string; // "$/MT"
  categories: string[]; // x-axis labels
  series: FreightSeries[];
}

export interface OceanFreightResponse {
  dischargePort: string;
  items: FreightChart[]; // Capes, Panamax
}

// --- Target above 2% -------------------------------------------------------

export interface BarRow {
  category: string;
  value: number; // MT
}

export interface BudgetActualRow {
  category: string;
  budget: number; // MT
  actual: number; // MT
}

export interface TargetResponse {
  unit: "MT";
  portwise: BarRow[];
  originwise: BudgetActualRow[];
  segmentwise: BudgetActualRow[];
}

// --- Filters ---------------------------------------------------------------

export interface OceanFreightFilters {
  dischargePort?: string;
  fromDate?: string;
  toDate?: string;
}

export interface TargetFilters {
  fromDate?: string;
  toDate?: string;
}
