// Logistics module types. Mirror of backend/src/types/logistics.ts —
// kept manually in sync.

// --- Vessel Sailed Out -----------------------------------------------------
export interface VesselSailedRow {
  id: string;
  vessel: string;
  coalGrade: string;
  tonnage: number; // MT
  origin: string;
  blDate: string; // ISO yyyy-mm-dd — Bill of Lading date
  etaDp: string; // ISO yyyy-mm-dd — ETA at discharge port
}

// --- Handling Rates --------------------------------------------------------
export interface HandlingRateRow {
  port: string;
  road: number; // INR/MT
  rake: number; // INR/MT
}

// --- Portwise PDA ----------------------------------------------------------
// PDA = Port Disbursement Account. One row per port + vessel-type combination,
// with the quantity handled and the per-metric-tonne (PMT) cost in USD and INR.
export interface PdaRow {
  id: string;
  port: string;
  vesselType: string;
  qty: number; // MT
  totalWithGst: number;
  pmtUsd: number; // per metric tonne, USD
  pmtInr: number; // per metric tonne, INR
}

// A fiscal-year half (e.g. "FY 25-26 H1"), driving the PDA card's period
// dropdown; the chosen `period` is passed to the PDA endpoint.
export interface PdaPeriod {
  period: string; // "2025-26-H1"
  periodDisplay: string; // "FY 25-26 H1"
}

// --- DP Handling Agents — Outstanding Payments (grouped column) ------------
export interface OutstandingSeries {
  agent: string; // shipping agent — series name
  data: number[]; // outstanding amount per category
}

export interface DpHandlingOutstanding {
  unit: string; // y-axis unit label, e.g. "Local Currency"
  categories: string[]; // x-axis groups, e.g. "Operations", "Pradip"
  series: OutstandingSeries[];
}

// --- Per-card responses + filters ------------------------------------------
// Each Logistics card has its own endpoint; there is no aggregate overview.
export interface VesselsSailedResponse {
  items: VesselSailedRow[];
}

export interface HandlingRatesResponse {
  items: HandlingRateRow[];
}

export interface PdaResponse {
  items: PdaRow[];
}

export interface PdaPeriodResponse {
  period: PdaPeriod[];
}

// Drives the fiscal-year dropdown in the Handling Rates card header.
export interface FiscalYear {
  fiscalYear: string; // "2025-26"
  fiscalYearDisplay: string; // "FY2025-26"
}

export interface FiscalYearResponse {
  fiscalYear: FiscalYear[];
}

// DP Handling Agents returns DpHandlingOutstanding directly.

export interface LogisticsFilters {
  fromDate?: string;
  toDate?: string;
}
