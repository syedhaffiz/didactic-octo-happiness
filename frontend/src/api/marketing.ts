import { apiClient, unwrap } from "./client";
import { USE_MOCK_DATA, mockDelay } from "./dataSource";
import type { ApiEnvelope } from "../types/api";
import type {
  IndexRange,
  IndexChart,
  IndexMovementResponse,
  MarketShareResponse,
  MarketShareParams,
  OceanFreightResponse,
  OceanFreightParams,
  TargetResponse,
  TargetParams,
} from "../types/marketing";
import {
  buildIndexMovement,
  buildOneIndexChart,
  buildMarketShare,
  buildOceanFreight,
  buildTarget,
} from "../mocks/marketing";

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

const httpMarketingApi = {
  indices: (range: IndexRange = "1") =>
    get<IndexMovementResponse>("/marketing/indices", { range }),
  indexOne: (code: string, range: IndexRange = "1") =>
    get<IndexChart>(`/marketing/indices/${encodeURIComponent(code)}`, { range }),
  marketShare: (p: MarketShareParams = {}) =>
    get<MarketShareResponse>("/marketing/market-share", p),
  oceanFreight: (p: OceanFreightParams = {}) =>
    get<OceanFreightResponse>("/marketing/ocean-freight", p),
  target: (p: TargetParams = {}) => get<TargetResponse>("/marketing/target", p),
};

const mockMarketingApi = {
  indices: (range: IndexRange = "1") => mockDelay(buildIndexMovement(range)),
  indexOne: (code: string, range: IndexRange = "1") => {
    const result = buildOneIndexChart(code, range);
    if (!result) {
      return Promise.reject(new Error(`not_found: Unknown index code: ${code}`));
    }
    return mockDelay(result);
  },
  marketShare: (p: MarketShareParams = {}) => mockDelay(buildMarketShare(p)),
  oceanFreight: (p: OceanFreightParams = {}) => mockDelay(buildOceanFreight(p)),
  target: (p: TargetParams = {}) => mockDelay(buildTarget(p)),
};

export const marketingApi = USE_MOCK_DATA ? mockMarketingApi : httpMarketingApi;
