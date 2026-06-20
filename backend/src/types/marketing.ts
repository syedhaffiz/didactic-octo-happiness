// Marketing module types. Mirrored in frontend/src/types/marketing.ts —
// kept manually in sync (a shared workspace is overkill at this scope).

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
