// Commercial Ops → Contracts. Frontend-only for now (mock data); the shapes are
// the contract the real API is expected to honour, so keep them backend-neutral.

/** EMD (earnest money deposit) state of a contract. `null` = not applicable / unknown. */
export type EmdStatus = "Pending" | "Received";

/** One term contract (TC) — a row of the Contract Details table. Every field
 *  that the upstream system may leave blank is nullable; the UI renders "—". */
export interface ContractRow {
  tcNo: string;
  /** "YYYY-MM-DD" */
  postingDate: string | null;
  customer: string | null;
  segment: string | null;
  /** Discharge plant / port display name. */
  plant: string | null;
  trader: string | null;
  /** Contracted quantity in MT — drives the status / port-wise MT figures. */
  quantityMt: number | null;
  openQty: number | null;
  openTcQty: number | null;
  country: string | null;
  /** Gross-as-received calorific value (GAR/NAR), kcal/kg. */
  gar: number | null;
  mine: string | null;
  tcRate: number | null;
  m2mRate: number | null;
  /** Mark-to-market value: (TC rate − M2M rate) × open qty. */
  m2mValue: number | null;
  /** TC rate × open qty. */
  tcValue: number | null;
  /** EMD amount in rupees. */
  emdAmount: number | null;
  emdStatus: EmdStatus | null;
  /** Days the EMD has been pending; null unless pending. */
  emdAgingDays: number | null;
  /** Contract status — shown as "Remarks" in the table. */
  status: string | null;
}

export interface ContractStatusBucket {
  status: string;
  count: number;
  quantityMt: number;
}

export interface ContractPortBucket {
  /** Catalogue port id — the value the `port` filter takes. */
  portId: string;
  port: string;
  count: number;
  quantityMt: number;
}

export interface EmdAgingPoint {
  port: string;
  /** Σ pending EMD amount, rupees. */
  emdAmount: number;
  /** Average days pending across the port's pending-EMD contracts. */
  agingDays: number;
}

export interface ContractsOverview {
  statuses: ContractStatusBucket[];
  totalContracts: number;
  totalQuantityMt: number;
  /** Port-wise split of contracts with a pending EMD. */
  ports: ContractPortBucket[];
  portTotalContracts: number;
  portTotalQuantityMt: number;
  emdAging: EmdAgingPoint[];
}

export interface ContractsResponse {
  items: ContractRow[];
}

/** One option of a Contracts filter dropdown. */
export interface ContractFilterOption {
  id: string;
  name: string;
}

/** Everything the Contracts overview filter row needs, in one payload. The
 *  three lists are independent — no option depends on another's selection. */
export interface ContractsFilterOptions {
  zones: ContractFilterOption[];
  ports: ContractFilterOption[];
  segments: ContractFilterOption[];
}

export interface ContractsFilters {
  zone?: string;
  port?: string;
  segment?: string;
  /** Exact contract status (details drill-down). */
  status?: string;
  /** EMD state (details drill-down from the port-wise card). */
  emd?: "pending";
  fromDate?: string;
  toDate?: string;
}
