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

// --- Portwise PDA (drilldown pie: Ports -> Operations) ---------------------
export interface PdaPiePoint {
  name: string;
  y: number;
  drilldown: string | null;
}

export interface PdaDrilldownSeries {
  id: string;
  tier: string; // label for the child slices, e.g. "Operations"
  data: PdaPiePoint[];
}

export interface PdaRootPie {
  rootName: string; // e.g. "Ports"
  root: PdaPiePoint[];
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

// Portwise PDA returns PdaRootPie, and DP Handling Agents returns
// DpHandlingOutstanding, directly.

export interface LogisticsFilters {
  fromDate?: string;
  toDate?: string;
}
