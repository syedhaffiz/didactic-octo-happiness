// Marketing module types. Mirrored in frontend/src/types/marketing.ts —
// kept manually in sync (a shared workspace is overkill at this scope).

export type MarketRange = "1W" | "1M" | "3M" | "1Y";

// --- Index Movement --------------------------------------------------------

export interface IndexSeries {
  name: string; // e.g. "ICI 1"
  data: number[];
}

export interface IndexChart {
  code: string; // "ICI Index" | "API Index"
  range: MarketRange;
  categories: string[]; // x-axis labels (e.g. "Day 1")
  series: IndexSeries[]; // ICI 1..5
}

export interface IndexMovementResponse {
  items: IndexChart[];
}

// --- Market Share ----------------------------------------------------------

export interface ShareRow {
  category: string; // "Own" | "Non-Own"
  mmt: number;
  totalMmt: number;
  pct: number;
}

export interface ShareSlice {
  label: string;
  value: number; // MMT
  pct: number;
}

export interface ZoneShareRow {
  zone: number; // 1..8
  pct: number;
}

export interface MarketShareResponse {
  unit: "MMT";
  overall: {
    total: number;
    rows: ShareRow[]; // Own, Non-Own
    slices: ShareSlice[]; // Own, Non-Own
  };
  byZone: {
    total: number;
    rows: ZoneShareRow[]; // zones 1..8
    slices: ShareSlice[]; // zones 1..8
  };
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

export interface MarketShareFilters {
  fromDate?: string;
  toDate?: string;
}

export interface OceanFreightFilters {
  dischargePort?: string;
  fromDate?: string;
  toDate?: string;
}

export interface TargetFilters {
  fromDate?: string;
  toDate?: string;
}
