// Commercial Ops → Plot Rent. Frontend-only for now (mock data); the shapes are
// the contract the real API is expected to honour.

/** One plot-rent ledger entry — a row of the Plot Rent table. Fields the
 *  upstream system may leave blank are nullable; the UI renders "—". */
export interface PlotRentEntry {
  /** Stable row id (document / line reference). */
  id: string;
  /** Plant code, e.g. "5234". */
  plant: string | null;
  /** Port display name; null when the entry isn't mapped to a port ("(Blank)"). */
  port: string | null;
  /** Name of the offsetting account. */
  accountName: string | null;
  /** Valuated amount in rupees (negative = credit / reversal). */
  valuatedAmount: number | null;
  /** "YYYY-MM-DD" */
  valueDate: string | null;
}

export interface PlotRentEntriesResponse {
  items: PlotRentEntry[];
}

export interface PlotRentPortPoint {
  /** Port display name; null for entries with no port ("(Blank)"). */
  port: string | null;
  /** Σ valuated amount in rupees; null when no entry carries an amount. */
  amount: number | null;
}

export interface PlotRentByPortResponse {
  items: PlotRentPortPoint[];
}

export interface PlotRentFilters {
  zone?: string;
  port?: string;
  fromDate?: string;
  toDate?: string;
}
