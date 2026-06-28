import { apiClient, unwrap } from "./client";
import { USE_MOCK_DATA, mockDelay } from "./dataSource";
import type { ApiEnvelope } from "../types/api";
import type {
  DpHandlingOutstanding,
  HandlingRatesResponse,
  LogisticsFilters,
  PdaDrilldownSeries,
  PdaRootPie,
  VesselsSailedResponse,
} from "../types/logistics";
import {
  buildHandlingRates,
  buildOutstanding,
  buildPdaDrill,
  buildPdaRoot,
  buildVesselsSailed,
} from "../mocks/logistics";

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

// One endpoint per card — there is no aggregate overview.
const httpLogisticsApi = {
  vesselsSailed: (p: LogisticsFilters = {}) =>
    get<VesselsSailedResponse>("/logistics/vessels-sailed", p),
  handlingRates: () => get<HandlingRatesResponse>("/logistics/handling-rates"),
  pda: () => get<PdaRootPie>("/logistics/pda"),
  outstanding: () => get<DpHandlingOutstanding>("/logistics/outstanding"),
  pdaDrill: (path: string) =>
    get<PdaDrilldownSeries>("/logistics/pda/drill", { path }),
};

const mockLogisticsApi = {
  vesselsSailed: (p: LogisticsFilters = {}) =>
    mockDelay<VesselsSailedResponse>({ items: buildVesselsSailed(p.fromDate, p.toDate) }),
  handlingRates: () => mockDelay<HandlingRatesResponse>({ items: buildHandlingRates() }),
  pda: () => mockDelay(buildPdaRoot()),
  outstanding: () => mockDelay(buildOutstanding()),
  pdaDrill: (path: string) => {
    const level = buildPdaDrill(path);
    if (!level) return Promise.reject(new Error(`not_found: Unknown drilldown path: ${path}`));
    return mockDelay(level);
  },
};

export const logisticsApi = USE_MOCK_DATA ? mockLogisticsApi : httpLogisticsApi;
