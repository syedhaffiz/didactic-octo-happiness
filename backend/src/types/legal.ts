// Legal module types. Mirrored in frontend/src/types/legal.ts —
// kept manually in sync (a shared workspace is overkill at this scope).

// --- Summary cards ---------------------------------------------------------

export interface LegalSummary {
  newCases: number;
  totalCases: number;
  newIssues: number;
  totalIssues: number;
}

// --- Critical Cases (list + detail) ----------------------------------------

export interface CriticalCase {
  // List columns.
  srNo: number;
  caseNo: string; // e.g. "EC/103/2022"
  category: string; // "SEB" | "Private" | "Insurance" | "Shipping" | …
  claimant: string;
  defendant: string;
  forum: string;
  claim: string; // free-form (currency + suffix, e.g. "Rs. 25 Cr. Approx + Interest")
  costIncurred: string;
  lawyer: string;
  lastDate: string; // dd.mm.yyyy (free-form to match Figma)
  nextDate: string; // dd.mm.yyyy OR text like "Awaited"

  // Modal-only fields — present on every list row so /critical-cases is the
  // single source of truth and the modal renders without a second fetch.
  caseType: string; // "Arbitration" | "Suit" | …
  title: string; // "WBPDCL vs. AEL" — used in modal header
  briefFacts: string;
  currentStatus: string;
}

export interface CriticalCasesResponse {
  items: CriticalCase[];
}

// --- Critical Issues (Pre-litigation Issues table) -------------------------

export interface CriticalIssue {
  srNo: number;
  legalIssue: string; // multi-paragraph text
  amountInvolved: string; // free-form (e.g. "NA", "Rs. 5 Cr")
  currentStatus: string;
}

export interface CriticalIssuesResponse {
  items: CriticalIssue[];
}

// --- Filter params ---------------------------------------------------------

export interface LegalFilters {
  dateRange?: string;
}
