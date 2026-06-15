import type {
  CriticalCasesResponse,
  CriticalIssuesResponse,
  LegalFilters,
  LegalSummary,
} from "../types/legal.js";
import {
  buildCriticalCases,
  buildCriticalIssues,
  buildLegalSummary,
} from "../mocks/legal.js";

export interface LegalRepository {
  getSummary(filters: LegalFilters): Promise<LegalSummary>;
  getCriticalCases(filters: LegalFilters): Promise<CriticalCasesResponse>;
  getCriticalIssues(filters: LegalFilters): Promise<CriticalIssuesResponse>;
}

class MockLegalRepository implements LegalRepository {
  async getSummary(filters: LegalFilters) {
    return buildLegalSummary(filters);
  }
  async getCriticalCases(filters: LegalFilters) {
    return buildCriticalCases(filters);
  }
  async getCriticalIssues(filters: LegalFilters) {
    return buildCriticalIssues(filters);
  }
}

export const legalRepository: LegalRepository = new MockLegalRepository();
