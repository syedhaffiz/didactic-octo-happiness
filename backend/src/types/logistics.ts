// Logistics module types. Mirrored in frontend/src/types/logistics.ts —
// kept manually in sync (a shared workspace is overkill at this scope).

// --- Vessel Sailed Out -----------------------------------------------------
// One row of the "Vessel Sailed Out" table. The frontend offers a tree filter
// over the Vessel / Coal Grade / Origin columns.
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
// PDA = Port Disbursement Account. Root pie is by port; drilling a port slice
// fetches the per-operation (shipping-agent) split for that port.

// A single pie slice. `drilldown` is the id of the child level, or null for a
// leaf slice.
export interface PdaPiePoint {
  name: string;
  y: number;
  drilldown: string | null;
}

// One drilldown level, fetched lazily on slice click. `tier` labels what the
// child slices represent (e.g. "Operations").
export interface PdaDrilldownSeries {
  id: string;
  tier: string;
  data: PdaPiePoint[];
}

// Only the root level (by port) ships with the page; deeper levels are fetched
// on demand via the drill endpoint.
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
