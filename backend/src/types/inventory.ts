export type IndexRange = "1W" | "1M" | "3M" | "1Y";

export interface PricePoint {
  date: string; // ISO date
  value: number;
}

export interface PriceIndex {
  code: string; // e.g. "ICI 4"
  cadence: "Daily" | "Weekly";
  range: IndexRange;
  series: PricePoint[];
  current: number;
  currentDate: string;
}

export interface IndexResponse {
  asOf: string;
  items: PriceIndex[];
}

// --- Inventory overview ----------------------------------------------------

export type KpiIconKey =
  | "physicalInventory"
  | "salesBooking"
  | "dispatch"
  | "vessels";

export interface InventoryKpi {
  id: KpiIconKey;
  title: string;
  primaryLabel: string;
  primaryValue: number;
  primaryUnit?: string;
  secondaryLabel: string;
  secondaryValue: number;
  secondaryUnit?: string;
  lastUpdated: string;
}

export interface PortInventoryRow {
  port: string;
  physicalStock: number;
  physicalUnsold: number;
}

export interface DispatchSummary {
  last24Hours: number;
  last7Days: number;
  mtdAggregate: number;
  deltaPct: number;
  unit: "MT";
}

export interface SalesMonth {
  month: string;
  value: number;
}

export interface VesselRow {
  vessel: string;
  coalGrade: string;
  tonnage: number;
  origin: string;
  blDate: string;
  etaDp: string;
}

export interface InventoryOverviewResponse {
  asOf: string;
  kpis: InventoryKpi[];
  currentInventory: PortInventoryRow[];
  dispatch: DispatchSummary;
  sales: SalesMonth[];
}

export interface InventoryFilters {
  port?: string;
  origin?: string;
  grade?: string;
}
