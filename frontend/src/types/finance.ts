// Mirror of backend/src/types/finance.ts. Kept manually in sync; a shared workspace
// is overkill for the current scope.

export type IconKey =
  | "revenue"
  | "sales"
  | "profitability"
  | "workingCapital"
  | "dispatch"
  | "inventoryDays";

export type Trend = "up" | "down";
export type Unit = "Cr" | "MMT" | "Days";

export interface KPI {
  id: IconKey;
  label: string;
  value: number;
  unit: Unit;
  deltaPct: number;
  trend: Trend;
  spark: number[];
  href: string;
}

export type ForexRange = "all" | "week" | "month";

export interface ForexPoint {
  day: string;
  rate: number;
}

export interface ForexResponse {
  range: ForexRange;
  points: ForexPoint[];
  exchangeRate: number;
  monthAverage: number;
}

export interface BreakdownItem {
  segment: string;
  value: number;
  unit: "Cr";
}

export interface DonutSlice {
  segment: string;
  value: number;
  pct: number;
}

export interface DonutResponse {
  total: number;
  unit: "Cr";
  slices: DonutSlice[];
}

export interface LedgerRow {
  companyCode: string;
  accountNumber: string;
  profitCentre: string;
  segment: string;
  grouping: string;
  debit: number;
  credit: number;
}

export interface BreakdownResponse {
  breakdown: BreakdownItem[];
  donut: DonutResponse;
  ledger: LedgerRow[];
}

export interface ProfitabilityBar {
  category: string;
  value: number;
}

export interface VesselRow {
  batchId: string;
  vessel: string;
  grade: string;
  origin: string;
  port: string;
  segment: string;
  profit: number;
}

export interface ProfitabilityResponse {
  mode: "port" | "segment";
  chart: ProfitabilityBar[];
  vessels: VesselRow[];
}

export interface BudgetActualRow {
  category: string;
  budget: number;
  actual: number;
  unit: "MMT" | "MT";
}

export interface SalesResponse {
  portwise: BudgetActualRow[];
  zonewise: BudgetActualRow[];
  segmentwise: BudgetActualRow[];
}

export interface OverviewResponse {
  kpis: KPI[];
  forex: ForexResponse;
}

export interface BudgetSeries {
  months: string[];
  budget: (number | null)[];
  actual: (number | null)[];
  unit: "MT" | "Cr";
}

export interface PbdRow {
  port: string;
  days: number;
}

export interface InventorySlice {
  segment: string;
  days: number;
}

export interface InventoryGauge {
  max: number;
  slices: InventorySlice[];
}

export interface ApprovedBudgetResponse {
  fy: string;
  volume: BudgetSeries;
  margin: BudgetSeries;
  pbd: PbdRow[];
  inventory: InventoryGauge;
}

export interface ApprovedBudgetParams {
  port?: string;
  grade?: string;
  zone?: string;
  origin?: string;
  fy?: string;
}
