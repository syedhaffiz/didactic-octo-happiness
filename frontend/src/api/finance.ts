import { apiClient, unwrap } from "./client";
import { USE_MOCK_DATA, mockDelay } from "./dataSource";
import type { ApiEnvelope } from "../types/api";
import type {
  ApprovedBudgetParams,
  ApprovedBudgetResponse,
  BreakdownResponse,
  ForexRange,
  ForexResponse,
  KPI,
  OverviewResponse,
  ProfitabilityResponse,
  SalesResponse,
} from "../types/finance";
import { buildApprovedBudget } from "../mocks/finance/approvedBudget";
import { buildBreakdown } from "../mocks/finance/breakdown";
import { buildForex } from "../mocks/finance/forex";
import { buildKpis } from "../mocks/finance/kpis";
import { buildOverview } from "../mocks/finance/overview";
import { buildProfitability } from "../mocks/finance/profitability";
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

export interface ProfitabilityParams extends RangeParams {
  mode: "port" | "segment";
  port?: string;
  segment?: string;
}

const httpFinanceApi = {
  overview: (p: RangeParams = {}) => get<OverviewResponse>("/finance/overview", p),
  kpis: (p: RangeParams = {}) => get<KPI[]>("/finance/kpis", p),
  forex: (range: ForexRange = "week") => get<ForexResponse>("/finance/forex", { range }),
  revenue: (p: PortRangeParams = {}) => get<BreakdownResponse>("/finance/revenue", p),
  workingCapital: (p: PortRangeParams = {}) =>
    get<BreakdownResponse>("/finance/working-capital", p),
  profitability: (p: ProfitabilityParams) =>
    get<ProfitabilityResponse>("/finance/profitability", p),
  sales: (p: RangeParams = {}) => get<SalesResponse>("/finance/sales", p),
  approvedBudget: (p: ApprovedBudgetParams = {}) =>
    get<ApprovedBudgetResponse>("/finance/approved-budget", p),
};

const mockFinanceApi = {
  overview: (p: RangeParams = {}) => mockDelay(buildOverview(p.fromDate, p.toDate)),
  kpis: (p: RangeParams = {}) => mockDelay(buildKpis(p.fromDate, p.toDate)),
  forex: (range: ForexRange = "week") => mockDelay(buildForex(range, new Date())),
  revenue: (p: PortRangeParams = {}) =>
    mockDelay(buildBreakdown("revenue", p.port, p.fromDate, p.toDate)),
  workingCapital: (p: PortRangeParams = {}) =>
    mockDelay(buildBreakdown("working-capital", p.port, p.fromDate, p.toDate)),
  profitability: (p: ProfitabilityParams) => {
    const filter = p.mode === "port" ? p.port : p.segment;
    return mockDelay(buildProfitability(p.mode, filter, p.fromDate, p.toDate));
  },
  sales: (p: RangeParams = {}) => mockDelay(buildSales(p.fromDate, p.toDate)),
  approvedBudget: (p: ApprovedBudgetParams = {}) => mockDelay(buildApprovedBudget(p)),
};

export const financeApi = USE_MOCK_DATA ? mockFinanceApi : httpFinanceApi;
