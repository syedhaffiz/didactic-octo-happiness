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
// Two drilldown pies + one stacked/grouped column chart.
//   geographic   : Market (Own/Non-Own) -> Zone -> Port
//   businessType : Market (Own/Non-Own) -> Port -> Business Type (Trader/End-User)
//   shipperReceiver : per-port Shipper vs Receiver volume, each split Own/Non-Own

// A single pie slice. `own`/`nonOwn` carry the absolute split for this entity
// so the tooltip can show the Own-vs-Others share at every level. `drilldown`
// is the id of the child series, or null for a leaf slice.
export interface MarketSharePiePoint {
  name: string;
  y: number;
  drilldown: string | null;
  own: number;
  nonOwn: number;
}

// One drilldown level, fetched lazily on slice click. `tier` is the label for
// what the child slices represent (e.g. "Zone", "Port", "Business Type") —
// used as the series name. A point whose `drilldown` is a non-null id is itself
// drillable (its children are fetched on click).
export interface MarketShareDrilldownSeries {
  id: string;
  tier: string;
  data: MarketSharePiePoint[];
}

// Only the root level (Own / Non-Own) ships with the page. Deeper levels are
// fetched on demand via the drill endpoint.
export interface MarketShareRootPie {
  rootName: string; // e.g. "Market Share"
  root: MarketSharePiePoint[];
}

// Which pie a drill request targets.
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
