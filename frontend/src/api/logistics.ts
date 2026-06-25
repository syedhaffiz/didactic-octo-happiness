import { apiClient, unwrap } from "./client";
import { USE_MOCK_DATA, mockDelay } from "./dataSource";
import type { ApiEnvelope } from "../types/api";
import type {
  LogisticsFilters,
  LogisticsResponse,
  PdaDrilldownSeries,
} from "../types/logistics";
import { buildLogistics, buildPdaDrill } from "../mocks/logistics";

// HTTP path identical to the backend so flipping `USE_MOCK_DATA` is the only
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

const httpLogisticsApi = {
  overview: (p: LogisticsFilters = {}) => get<LogisticsResponse>("/logistics", p),
  pdaDrill: (path: string) =>
    get<PdaDrilldownSeries>("/logistics/pda/drill", { path }),
};

const mockLogisticsApi = {
  overview: (p: LogisticsFilters = {}) => mockDelay(buildLogistics(p)),
  pdaDrill: (path: string) => {
    const level = buildPdaDrill(path);
    if (!level) return Promise.reject(new Error(`not_found: Unknown drilldown path: ${path}`));
    return mockDelay(level);
  },
};

export const logisticsApi = USE_MOCK_DATA ? mockLogisticsApi : httpLogisticsApi;
