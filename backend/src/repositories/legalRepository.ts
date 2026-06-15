import type {
  CriticalCase,
  CriticalCasesResponse,
  CriticalIssuesResponse,
  LegalFilters,
  LegalSummary,
} from "../types/legal.js";
import {
  buildCaseByNo,
  buildCriticalCases,
  buildCriticalIssues,
  buildLegalSummary,
} from "../mocks/legal.js";

export interface LegalRepository {
  getSummary(filters: LegalFilters): Promise<LegalSummary>;
  getCriticalCases(filters: LegalFilters): Promise<CriticalCasesResponse>;
  getCaseByNo(caseNo: string): Promise<CriticalCase | null>;
  getCriticalIssues(filters: LegalFilters): Promise<CriticalIssuesResponse>;
}

class MockLegalRepository implements LegalRepository {
  async getSummary(filters: LegalFilters) {
    return buildLegalSummary(filters);
  }
  async getCriticalCases(filters: LegalFilters) {
    return buildCriticalCases(filters);
  }
  async getCaseByNo(caseNo: string) {
    return buildCaseByNo(caseNo);
  }
  async getCriticalIssues(filters: LegalFilters) {
    return buildCriticalIssues(filters);
  }
}

export const legalRepository: LegalRepository = new MockLegalRepository();
