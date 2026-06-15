import { legalRepository } from "../repositories/legalRepository.js";
import type { LegalFilters } from "../types/legal.js";

export const legalService = {
  summary: (filters: LegalFilters) => legalRepository.getSummary(filters),
  criticalCases: (filters: LegalFilters) => legalRepository.getCriticalCases(filters),
  caseByNo: (caseNo: string) => legalRepository.getCaseByNo(caseNo),
  criticalIssues: (filters: LegalFilters) => legalRepository.getCriticalIssues(filters),
};
