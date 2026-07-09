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
// Used by /finance/revenue — the combined Revenue screen. The `Segment Wise`
// card reads `items` + `total`; the `Port Wise` card reads `portwise`. Legacy
// Port/Segment ledger drilldowns under /finance/revenue/port and
// /finance/revenue/segment share the ledger row shapes below.

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
// Cards on /finance/overview/profitability:
//   - Total Profitability headline (value + vs Budget / vs last year)
//   - Vessel Wise drilldown link
//   - Segment Wise KPI tiles + donut (currency-switchable INR/USD)
//   - Port Wise budget-vs-actual column chart

export type Currency = "INR" | "USD";

// One Segment Wise entry — drives both the KPI tiles and the donut slices.
// `value` is a whole-number amount in the response currency's base unit; `pct`
// is its share of the total; `deltaVsBudget` is a signed percentage.
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
  total: { value: number; deltaVsBudget: number; deltaVsLastYear: number };
  segmentwise: ProfitabilitySegmentItem[];
  portwise: ProfitabilityPortRow[];
}

// --- Vessel Profitability — Sales tab table ------------------------------

export interface VesselSalesRow {
  batchId: string;
  vessel: string;
  segment: string;
  volume: number;
  profit: number;
  pmtProfit: number;
}

export interface VesselSalesResponse {
  items: VesselSalesRow[];
}

// --- Vessel Profitability — Handling tab table ---------------------------

export interface VesselHandlingRow {
  batchId: string;
  vessel: string;
  grade: string;
  origin: string;
  port: string;
  segment: string;
  volume: number;
  profit: number;
  pmtProfit: number;
}

export interface VesselHandlingResponse {
  items: VesselHandlingRow[];
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

export interface DateRange {
  from: Date;
  to: Date;
}

// --- Approved Budget -------------------------------------------------------

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

export interface ApprovedBudgetFilters {
  port?: string;
  grade?: string;
  zone?: string;
  origin?: string;
  fy?: string;
}
