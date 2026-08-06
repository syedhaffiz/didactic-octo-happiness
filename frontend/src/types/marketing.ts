// Mirror of backend/src/types/marketing.ts. Kept manually in sync.

export type IndexRange = "1" | "2";
export type IndexCadence = "daily" | "weekly";

// --- Index Movement --------------------------------------------------------

export interface IndexSeries {
  name: string;
  data: number[];
}

export interface IndexChart {
  code: string;        // URL slug: "ici" | "api-daily" | "api-weekly"
  title: string;       // display title: "ICI Index" | "API Index"
  cadence: IndexCadence;
  range: IndexRange;
  categories: string[];
  series: IndexSeries[];
}

export interface IndexMovementResponse {
  items: IndexChart[];
}

// --- Market Share ----------------------------------------------------------
// Mirror of backend/src/types/marketing.ts. Seven cards, each with its own
// endpoint; all accept the shared MarketShareParams query.
// `own` = the client's own volume; `nonOwn` = competitors. Brand-facing series
// labels are applied only in the UI (see marketShareSeriesLabels in tokens.ts).

// A filter dropdown option (id sent to the API, name shown to the user).
export interface FilterRef {
  id: string;
  name: string;
}

// A grouped own/non-own bar row (one x-axis category, two columns).
export interface PairedBarRow {
  category: string;
  own: number;
  nonOwn: number;
}

// Quarterwise Import: one group per quarter, each with a paired row per FY.
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

// Shared response for the five simple grouped-bar cards.
export interface MarketSharePairedResponse {
  unit: string;
  rows: PairedBarRow[];
}

export interface MarketShareQuarterwiseResponse {
  unit: string;
  groups: QuarterGroup[];
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

// Shared query for every Market Share data endpoint. `fiscalYears` / `quarters`
// are multiselect, sent comma-joined; the rest are single-select ids.
export interface MarketShareParams {
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
export interface OceanFreightParams {
  dischargePort?: string;
  fromDate?: string;
  toDate?: string;
}
export interface TargetParams {
  fromDate?: string;
  toDate?: string;
}
