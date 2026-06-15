import { apiClient, unwrap } from "./client";
import { USE_MOCK_DATA, mockDelay } from "./dataSource";
import type { ApiEnvelope } from "../types/api";
import type {
  CriticalCase,
  CriticalCasesResponse,
  CriticalIssuesResponse,
  LegalFilters,
  LegalSummary,
} from "../types/legal";
import {
  buildCaseByNo,
  buildCriticalCases,
  buildCriticalIssues,
  buildLegalSummary,
} from "../mocks/legal";

// HTTP path identical to the backend so flipping USE_MOCK_DATA is the only
// change required to switch over to the real API.
const get = async <T>(
  path: string,
  params?: Record<string, string | undefined> | object,
): Promise<T> => {
  const clean = params
    ? Object.fromEntries(
        Object.entries(params as Record<string, string | undefined>).filter(
          ([, v]) => v !== undefined && v !== "",
        ),
      )
    : undefined;
  const res = await apiClient.get<ApiEnvelope<T>>(path, { params: clean });
  return unwrap(res);
};

const httpLegalApi = {
  summary: (f: LegalFilters = {}) => get<LegalSummary>("/legal/summary", f),
  criticalCases: (f: LegalFilters = {}) =>
    get<CriticalCasesResponse>("/legal/critical-cases", f),
  caseByNo: (caseNo: string) =>
    get<CriticalCase>(`/legal/critical-cases/${encodeURIComponent(caseNo)}`),
  criticalIssues: (f: LegalFilters = {}) =>
    get<CriticalIssuesResponse>("/legal/critical-issues", f),
};

const mockLegalApi = {
  summary: (f: LegalFilters = {}) => mockDelay(buildLegalSummary(f)),
  criticalCases: (f: LegalFilters = {}) => mockDelay(buildCriticalCases(f)),
  caseByNo: (caseNo: string) => {
    const result = buildCaseByNo(caseNo);
    if (!result) return Promise.reject(new Error(`not_found: Unknown case: ${caseNo}`));
    return mockDelay(result);
  },
  criticalIssues: (f: LegalFilters = {}) => mockDelay(buildCriticalIssues(f)),
};

export const legalApi = USE_MOCK_DATA ? mockLegalApi : httpLegalApi;
