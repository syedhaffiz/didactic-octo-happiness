import { apiClient, unwrap } from "./client";
import { USE_MOCK_DATA, mockDelay } from "./dataSource";
import type { ApiEnvelope } from "../types/api";
import type {
  IndexRange,
  IndexChart,
  IndexMovementResponse,
  MarketShareParams,
  MarketShareFilterOptions,
  MarketSharePairedResponse,
  MarketShareQuarterwiseResponse,
  MarketShareSplitResponse,
  OceanFreightResponse,
  OceanFreightParams,
  TargetResponse,
  TargetParams,
  IiaBillingFilterOptions,
  IiaBillingParams,
  IiaBillingResponse,
  IiaPortType,
} from "../types/marketing";
import {
  buildIndexMovement,
  buildOneIndexChart,
  buildMarketShareSplit,
  buildImportQuantity,
  buildByCategory,
  buildQuarterwise,
  buildIndustrywise,
  buildOriginwise,
  buildPortwise,
  buildMarketShareFilterOptions,
  buildOceanFreight,
  buildTarget,
  buildIiaBilling,
  buildIiaBillingFilterOptions,
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
  // Market Share — one call per card, all sharing the filter query.
  marketShareSplit: (p: MarketShareParams = {}) =>
    get<MarketShareSplitResponse>("/marketing/market-share/split", p),
  marketShareImportQuantity: (p: MarketShareParams = {}) =>
    get<MarketSharePairedResponse>("/marketing/market-share/import-quantity", p),
  marketShareByCategory: (p: MarketShareParams = {}) =>
    get<MarketSharePairedResponse>("/marketing/market-share/by-category", p),
  marketShareQuarterwise: (p: MarketShareParams = {}) =>
    get<MarketShareQuarterwiseResponse>("/marketing/market-share/quarterwise", p),
  marketShareIndustrywise: (p: MarketShareParams = {}) =>
    get<MarketSharePairedResponse>("/marketing/market-share/industrywise", p),
  marketShareOriginwise: (p: MarketShareParams = {}) =>
    get<MarketSharePairedResponse>("/marketing/market-share/originwise", p),
  marketSharePortwise: (p: MarketShareParams = {}) =>
    get<MarketSharePairedResponse>("/marketing/market-share/portwise", p),
  marketShareFilterOptions: () =>
    get<MarketShareFilterOptions>("/marketing/market-share/filters"),
  oceanFreight: (p: OceanFreightParams = {}) =>
    get<OceanFreightResponse>("/marketing/ocean-freight", p),
  target: (p: TargetParams = {}) => get<TargetResponse>("/marketing/target", p),
  // IIA Billing — one table per tab (load / discharge port), shared filters.
  iiaBilling: (portType: IiaPortType, p: IiaBillingParams = {}) =>
    get<IiaBillingResponse>("/marketing/iia-billing", { portType, ...p }),
  iiaBillingFilterOptions: () =>
    get<IiaBillingFilterOptions>("/marketing/iia-billing/filters"),
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
  marketShareSplit: (p: MarketShareParams = {}) => mockDelay(buildMarketShareSplit(p)),
  marketShareImportQuantity: (p: MarketShareParams = {}) => mockDelay(buildImportQuantity(p)),
  marketShareByCategory: (p: MarketShareParams = {}) => mockDelay(buildByCategory(p)),
  marketShareQuarterwise: (p: MarketShareParams = {}) => mockDelay(buildQuarterwise(p)),
  marketShareIndustrywise: (p: MarketShareParams = {}) => mockDelay(buildIndustrywise(p)),
  marketShareOriginwise: (p: MarketShareParams = {}) => mockDelay(buildOriginwise(p)),
  marketSharePortwise: (p: MarketShareParams = {}) => mockDelay(buildPortwise(p)),
  marketShareFilterOptions: () => mockDelay(buildMarketShareFilterOptions()),
  oceanFreight: (p: OceanFreightParams = {}) => mockDelay(buildOceanFreight(p)),
  target: (p: TargetParams = {}) => mockDelay(buildTarget(p)),
  iiaBilling: (portType: IiaPortType, p: IiaBillingParams = {}) =>
    mockDelay(buildIiaBilling(portType, p)),
  iiaBillingFilterOptions: () => mockDelay(buildIiaBillingFilterOptions()),
};

export const marketingApi = USE_MOCK_DATA ? mockMarketingApi : httpMarketingApi;
