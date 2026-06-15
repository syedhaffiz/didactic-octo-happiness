// Mirror of backend/src/types/legal.ts. Kept manually in sync.

export interface LegalSummary {
  newCases: number;
  totalCases: number;
  newIssues: number;
  totalIssues: number;
}

export interface CriticalCase {
  // List columns.
  srNo: number;
  caseNo: string;
  category: string;
  claimant: string;
  defendant: string;
  forum: string;
  claim: string;
  costIncurred: string;
  lawyer: string;
  lastDate: string;
  nextDate: string;

  // Modal-only.
  caseType: string;
  title: string;
  briefFacts: string;
  currentStatus: string;
}

export interface CriticalCasesResponse {
  items: CriticalCase[];
}

export interface CriticalIssue {
  srNo: number;
  legalIssue: string;
  amountInvolved: string;
  currentStatus: string;
}

export interface CriticalIssuesResponse {
  items: CriticalIssue[];
}

export interface LegalFilters {
  dateRange?: string;
}
