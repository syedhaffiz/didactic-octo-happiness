import { apiClient, unwrap } from "./client";
import { USE_MOCK_DATA, mockDelay } from "./dataSource";
import type { ApiEnvelope } from "../types/api";
import type {
  ApprovedBudgetParams,
  ApprovedBudgetResponse,
  BreakdownResponse,
  Currency,
  ForexRange,
  ForexResponse,
  HandlingBatchDetailResponse,
  KPI,
  NetMarginProfitabilityResponse,
  OverviewResponse,
  RevenueBreakdownResponse,
  RevenuePeriod,
  RevenuePortResponse,
  RevenueSegmentResponse,
  SalesBatchDetailResponse,
  SalesResponse,
  VesselHandlingResponse,
  VesselSalesResponse,
} from "../types/finance";
import { buildApprovedBudget } from "../mocks/finance/approvedBudget";
import { buildBreakdown } from "../mocks/finance/breakdown";
import { buildForex } from "../mocks/finance/forex";
import { buildKpis } from "../mocks/finance/kpis";
import { buildOverview } from "../mocks/finance/overview";
import {
  buildHandlingBatchDetail,
  buildNetMarginProfitability,
  buildSalesBatchDetail,
  buildVesselHandling,
  buildVesselSales,
} from "../mocks/finance/profitability";
import {
  buildRevenueBreakdown,
  buildRevenuePort,
  buildRevenueSegment,
} from "../mocks/finance/revenue";
import { buildSales } from "../mocks/finance/sales";

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

export interface RangeParams {
  fromDate?: string;
  toDate?: string;
}

export interface PortRangeParams extends RangeParams {
  port?: string;
}

export interface NetMarginParams extends PortRangeParams {
  currency?: Currency;
}

export interface RevenuePeriodParams {
  period?: RevenuePeriod;
}

export interface PortOnlyParams {
  port?: string;
}

export interface SegmentOnlyParams {
  segment?: string;
}

const httpFinanceApi = {
  overview: (p: RangeParams = {}) => get<OverviewResponse>("/finance/overview", p),
  kpis: (p: RangeParams = {}) => get<KPI[]>("/finance/kpis", p),
  forex: (range: ForexRange = "week") => get<ForexResponse>("/finance/forex", { range }),
  revenueBreakdown: (p: RevenuePeriodParams = {}) =>
    get<RevenueBreakdownResponse>("/finance/revenue", p),
  revenuePort: (p: PortOnlyParams = {}) =>
    get<RevenuePortResponse>("/finance/revenue/port", p),
  revenueSegment: (p: SegmentOnlyParams = {}) =>
    get<RevenueSegmentResponse>("/finance/revenue/segment", p),
  workingCapital: (p: PortRangeParams = {}) =>
    get<BreakdownResponse>("/finance/working-capital", p),
  netMarginProfitability: (p: NetMarginParams = {}) =>
    get<NetMarginProfitabilityResponse>("/finance/profitability", p),
  vesselSales: (p: PortRangeParams = {}) =>
    get<VesselSalesResponse>("/finance/profitability/vessels/sales", p),
  vesselHandling: (p: PortRangeParams = {}) =>
    get<VesselHandlingResponse>("/finance/profitability/vessels/handling", p),
  salesBatchDetail: (batchId: string) =>
    get<SalesBatchDetailResponse>(
      `/finance/profitability/vessels/sales/${encodeURIComponent(batchId)}`,
    ),
  handlingBatchDetail: (batchId: string) =>
    get<HandlingBatchDetailResponse>(
      `/finance/profitability/vessels/handling/${encodeURIComponent(batchId)}`,
    ),
  sales: (p: RangeParams = {}) => get<SalesResponse>("/finance/sales", p),
  approvedBudget: (p: ApprovedBudgetParams = {}) =>
    get<ApprovedBudgetResponse>("/finance/approved-budget", p),
};

const mockFinanceApi = {
  overview: (p: RangeParams = {}) => mockDelay(buildOverview(p.fromDate, p.toDate)),
  kpis: (p: RangeParams = {}) => mockDelay(buildKpis(p.fromDate, p.toDate)),
  forex: (range: ForexRange = "week") => mockDelay(buildForex(range, new Date())),
  revenueBreakdown: (p: RevenuePeriodParams = {}) =>
    mockDelay(buildRevenueBreakdown(p.period ?? "YTD")),
  revenuePort: (p: PortOnlyParams = {}) => mockDelay(buildRevenuePort(p.port)),
  revenueSegment: (p: SegmentOnlyParams = {}) => mockDelay(buildRevenueSegment(p.segment)),
  workingCapital: (p: PortRangeParams = {}) =>
    mockDelay(buildBreakdown("working-capital", p.port, p.fromDate, p.toDate)),
  netMarginProfitability: (p: NetMarginParams = {}) =>
    mockDelay(buildNetMarginProfitability(p.port, p.currency ?? "INR", p.fromDate, p.toDate)),
  vesselSales: (p: PortRangeParams = {}) =>
    mockDelay(buildVesselSales(p.port, p.fromDate, p.toDate)),
  vesselHandling: (p: PortRangeParams = {}) =>
    mockDelay(buildVesselHandling(p.port, p.fromDate, p.toDate)),
  salesBatchDetail: (batchId: string) => mockDelay(buildSalesBatchDetail(batchId)),
  handlingBatchDetail: (batchId: string) => mockDelay(buildHandlingBatchDetail(batchId)),
  sales: (p: RangeParams = {}) => mockDelay(buildSales(p.fromDate, p.toDate)),
  approvedBudget: (p: ApprovedBudgetParams = {}) => mockDelay(buildApprovedBudget(p)),
};

export const financeApi = USE_MOCK_DATA ? mockFinanceApi : httpFinanceApi;
