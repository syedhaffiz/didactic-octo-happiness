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
// Mirror of backend/src/types/marketing.ts.

export interface MarketSharePiePoint {
  name: string;
  y: number;
  drilldown: string | null;
  own: number;
  nonOwn: number;
}

// One drilldown level, fetched lazily on slice click.
export interface MarketShareDrilldownSeries {
  id: string;
  tier: string;
  data: MarketSharePiePoint[];
}

// Only the root level ships with the page; deeper levels are fetched on demand.
export interface MarketShareRootPie {
  rootName: string;
  root: MarketSharePiePoint[];
}

export type MarketShareDimension = "geographic" | "businessType";

export interface ShipperReceiverRow {
  port: string;
  shipperOwn: number;
  shipperNonOwn: number;
  receiverOwn: number;
  receiverNonOwn: number;
}

export interface MarketShareResponse {
  unit: "MT";
  geographic: MarketShareRootPie;
  businessType: MarketShareRootPie;
  shipperReceiver: ShipperReceiverRow[];
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
