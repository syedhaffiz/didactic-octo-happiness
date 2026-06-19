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

// --- Revenue suite -------------------------------------------------------
// Used by /finance/revenue (breakdown screen) and the Port/Segment ledger
// drilldowns under /finance/revenue/port and /finance/revenue/segment.

export type RevenuePeriod = "YTD" | "MTD";

export interface RevenueBreakdownCard {
  segment: string;
  value: number;
  unit: "Cr";
  color: string;
}

export interface RevenueBreakdownResponse {
  period: RevenuePeriod;
  total: number;
  unit: "Cr";
  cards: RevenueBreakdownCard[];
  slices: DonutSlice[];
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
//   - Port Wise horizontal bar chart (currency-switchable INR/USD)
//   - Total Profitability headline
//   - Vessel Wise drilldown link
//   - Segment Wise treemap

export type Currency = "INR" | "USD";

export interface PortBar {
  port: string;
  value: number; // displayed in Cr/M depending on currency
}

export interface SegmentSlice {
  segment: string;
  value: number; // arbitrary unit (relative size in the treemap)
}

export interface NetMarginProfitabilityResponse {
  total: { value: number; unit: "Cr"; deltaPct: number; trend: "up" | "down" };
  portwise: { currency: Currency; rows: PortBar[] };
  segmentwise: SegmentSlice[];
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

export interface ApprovedBudgetFilters {
  port?: string;
  grade?: string;
  zone?: string;
  origin?: string;
  fy?: string;
}
