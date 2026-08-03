import { apiClient, unwrap } from "./client";
import { USE_MOCK_DATA, mockDelay } from "./dataSource";
import type { ApiEnvelope } from "../types/api";
import type {
  DpHandlingOutstanding,
  FiscalYearResponse,
  HandlingRatesResponse,
  LogisticsFilters,
  PdaPeriodResponse,
  PdaResponse,
  VesselsSailedResponse,
} from "../types/logistics";
import {
  buildFiscalYears,
  buildHandlingRates,
  buildOutstanding,
  buildPda,
  buildPdaPeriods,
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
  fiscalYears: () => get<FiscalYearResponse>("/logistics/fiscal-year"),
  handlingRates: (year?: string) =>
    get<HandlingRatesResponse>("/logistics/handling-rates", { year }),
  pda: (period?: string) => get<PdaResponse>("/logistics/pda", { period }),
  pdaPeriods: () => get<PdaPeriodResponse>("/logistics/pda/periods"),
  outstanding: () => get<DpHandlingOutstanding>("/logistics/outstanding"),
};

const mockLogisticsApi = {
  vesselsSailed: (p: LogisticsFilters = {}) =>
    mockDelay<VesselsSailedResponse>({ items: buildVesselsSailed(p.fromDate, p.toDate) }),
  fiscalYears: () => mockDelay<FiscalYearResponse>({ fiscalYear: buildFiscalYears() }),
  handlingRates: (year?: string) =>
    mockDelay<HandlingRatesResponse>({ items: buildHandlingRates(year) }),
  pda: (period?: string) => mockDelay<PdaResponse>({ items: buildPda(period) }),
  pdaPeriods: () => mockDelay<PdaPeriodResponse>({ period: buildPdaPeriods() }),
  outstanding: () => mockDelay(buildOutstanding()),
};

export const logisticsApi = USE_MOCK_DATA ? mockLogisticsApi : httpLogisticsApi;
