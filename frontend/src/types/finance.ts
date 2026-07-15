// Mirror of backend/src/types/finance.ts. Kept manually in sync; a shared workspace
// is overkill for the current scope.

export type IconKey =
  | "revenue"
  | "sales"
  | "profitability"
  | "workingCapital"
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

// --- Revenue suite -------------------------------------------------------

// One combined breakdown entry — drives both the Segment Wise KPI cards and the
// donut slices (they describe the same per-segment figure). `value` is a
// whole-number amount in the response currency's base unit (rupees for INR,
// dollars for USD); the UI formats it as Cr/L or $M. `pct` is its share of the
// total; the two deltas are signed percentages vs budget and vs last year.
export interface RevenueBreakdownItem {
  segment: string;
  value: number;
  pct: number;
  deltaVsBudget: number;
  deltaVsLastYear: number;
}

// One Port Wise bar pair — budget vs actual for a single port, in the response
// currency's base unit. The UI scales to Cr (INR) or M (USD) for the chart.
export interface RevenuePortBudgetActual {
  port: string;
  budget: number;
  actual: number;
}

export interface RevenueBreakdownResponse {
  currency: Currency;
  total: number;
  totalDeltaVsBudget: number;
  totalDeltaVsLastYear: number;
  items: RevenueBreakdownItem[];
  portwise: RevenuePortBudgetActual[];
}

export interface RevenuePortRow {
  port: string;
  companyCode: string;
  accountNumber: string;
  profitCentre: string;
  accumulatedBalance: number;
}

export interface RevenuePortResponse {
  items: RevenuePortRow[];
}

export interface RevenueSegmentRow {
  segment: string;
  companyCode: string;
  accountNumber: string;
  profitCentre: string;
  accumulatedBalance: number;
}

export interface RevenueSegmentResponse {
  items: RevenueSegmentRow[];
}

// --- Profitability (Net Margin) -----------------------------------------

export type Currency = "INR" | "USD";

// One Segment Wise entry — drives both the KPI tiles and the donut slices (they
// describe the same per-segment figure). `value` is a whole-number amount in the
// response currency's base unit (rupees for INR, dollars for USD); the UI formats
// it as Cr/L or $M. `pct` is its share of the total; `deltaVsBudget` is a signed
// percentage.
export interface ProfitabilitySegmentItem {
  segment: string;
  value: number;
  pct: number;
  deltaVsBudget: number;
}

// One Port Wise bar pair — budget vs actual for a single port, in the response
// currency's base unit. The UI scales to Cr (INR) or M (USD) for the chart.
export interface ProfitabilityPortRow {
  port: string;
  budget: number;
  actual: number;
}

export interface NetMarginProfitabilityResponse {
  currency: Currency;
  // `value` is a whole-number amount in the response currency's base unit; the
  // two deltas are signed percentages vs budget and vs last year.
  total: { value: number; deltaVsBudget: number; deltaVsLastYear: number };
  segmentwise: ProfitabilitySegmentItem[];
  portwise: ProfitabilityPortRow[];
}

// --- Vessel Profitability -------------------------------------------------

// The four stat tiles above both vessel tables. `revenue` and `totalProfit` are
// whole-number amounts in the response currency's base unit (rupees for INR,
// dollars for USD); `totalVolume` is in MT.
export interface VesselSummary {
  revenue: number;
  totalProfit: number;
  totalVessels: number;
  totalVolume: number;
}

// --- Vessel Profitability — Sales tab table ------------------------------

// Per-MT figures are rounded to 2 decimals. `profitPerMtUsd` is always in USD
// regardless of the currency toggle — it's a column of its own in the design.
export interface VesselSalesRow {
  batchId: string;
  vessel: string;
  segment: string;
  volume: number;
  revenue: number;
  revPerMt: number;
  profit: number;
  profitPerMt: number;
  profitPerMtUsd: number;
}

export interface VesselSalesResponse {
  currency: Currency;
  summary: VesselSummary;
  /** Total rows before the search filter — drives the "X of Y rows" count. */
  total: number;
  items: VesselSalesRow[];
}

// Per-column search terms (case-insensitive substring). Every field is
// optional; an omitted field matches everything.
export interface VesselSalesSearch {
  batchId?: string;
  vessel?: string;
  segment?: string;
}

// --- Vessel Profitability — Handling tab table ---------------------------

// Handling sub-tab. All / Sagarmala / CIF show the same columns (Customer);
// TPH swaps Customer for Port.
export type HandlingCategory = "all" | "sagarmala" | "tph" | "cif";

// One row carries both `customer` and `port` — each sub-tab's column set picks
// the one it displays.
export interface VesselHandlingRow {
  batchId: string;
  vessel: string;
  customer: string;
  port: string;
  volume: number;
  profit: number;
  pmtProfit: number;
}

export interface VesselHandlingResponse {
  currency: Currency;
  category: HandlingCategory;
  summary: VesselSummary;
  /** Total rows before the search filter — drives the "X of Y rows" count. */
  total: number;
  items: VesselHandlingRow[];
}

// Per-column search terms (case-insensitive substring). Every field is
// optional; an omitted field matches everything.
export interface VesselHandlingSearch {
  batchId?: string;
  vessel?: string;
  customer?: string;
  port?: string;
}

// --- Batch ID drilldown ---------------------------------------------------

// The six stat tiles above both batch-detail tables. `totalVolume` is in MT;
// every other figure is a whole-number rupee amount.
export interface BatchSummary {
  totalVolume: number;
  profit: number;
  roadFreight: number;
  railwayFreight: number;
  demurrage: number;
  penalty: number;
}

// Per-column search terms for both batch-detail tables (case-insensitive
// substring). Every field is optional; an omitted field matches everything.
export interface BatchDetailSearch {
  batchId?: string;
  customerName?: string;
  plantName?: string;
  tradeContractNo?: string;
}

// --- Batch ID drilldown — Sales ------------------------------------------

export interface SalesBatchDetailRow {
  batchId: string;
  customerName: string;
  plantName: string;
  tradeContractNo: string;
  billAmount: number;
  billQuantity: number;
  cogsValue: number;
}

export interface SalesBatchDetailResponse {
  batchId: string;
  summary: BatchSummary;
  /** Total rows before the search filter — drives the "X of Y rows" count. */
  total: number;
  items: SalesBatchDetailRow[];
}

// --- Batch ID drilldown — Handling ---------------------------------------

export interface HandlingBatchDetailRow {
  batchId: string;
  customerName: string;
  plantName: string;
  tradeContractNo: string;
  tphCifCoalHandlingQty: number;
  tphCoalHandlingQty: number;
  sagarmalaHandlingCalculatedQty: number;
  sagarmalaHandlingPostedQty: number;
}

export interface HandlingBatchDetailResponse {
  batchId: string;
  summary: BatchSummary;
  /** Total rows before the search filter — drives the "X of Y rows" count. */
  total: number;
  items: HandlingBatchDetailRow[];
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
