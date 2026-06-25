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

// --- Response + filters ----------------------------------------------------
export interface LogisticsResponse {
  vesselsSailed: VesselSailedRow[];
  handlingRates: HandlingRateRow[];
  pda: PdaRootPie;
}

export interface LogisticsFilters {
  fromDate?: string;
  toDate?: string;
}
