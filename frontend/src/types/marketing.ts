// Mirror of backend/src/types/marketing.ts. Kept manually in sync.

export type MarketRange = "1W" | "1M" | "3M" | "1Y";

// --- Index Movement --------------------------------------------------------

export interface IndexSeries {
  name: string;
  data: number[];
}

export interface IndexChart {
  code: string; // "ICI Index" | "API Index"
  range: MarketRange;
  categories: string[];
  series: IndexSeries[];
}

export interface IndexMovementResponse {
  items: IndexChart[];
}

// --- Market Share ----------------------------------------------------------

export interface ShareRow {
  category: string;
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
  zone: number;
  pct: number;
}

export interface MarketShareResponse {
  unit: "MMT";
  overall: { total: number; rows: ShareRow[]; slices: ShareSlice[] };
  byZone: { total: number; rows: ZoneShareRow[]; slices: ShareSlice[] };
}

// --- Ocean Freight ---------------------------------------------------------

export interface FreightSeries {
  name: string;
  data: number[];
}

export interface FreightChart {
  vesselType: string; // "Capes" | "Panamax"
  unit: string; // "$/MT"
  categories: string[];
  series: FreightSeries[];
}

export interface OceanFreightResponse {
  dischargePort: string;
  items: FreightChart[];
}

// --- Target above 2% -------------------------------------------------------

export interface BarRow {
  category: string;
  value: number; // MT
}

export interface BudgetActualRow {
  category: string;
  budget: number;
  actual: number;
}

export interface TargetResponse {
  unit: "MT";
  portwise: BarRow[];
  originwise: BudgetActualRow[];
  segmentwise: BudgetActualRow[];
}

// --- Filter params ---------------------------------------------------------

export interface MarketShareParams {
  dateRange?: string;
}
export interface OceanFreightParams {
  dischargePort?: string;
  dateRange?: string;
}
export interface TargetParams {
  dateRange?: string;
}
