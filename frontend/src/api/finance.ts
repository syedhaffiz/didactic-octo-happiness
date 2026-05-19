import { apiClient, unwrap } from "./client";
import type { ApiEnvelope } from "../types/api";
import type {
  BreakdownResponse,
  ForexRange,
  ForexResponse,
  KPI,
  OverviewResponse,
  ProfitabilityResponse,
  SalesResponse,
} from "../types/finance";

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
  dateRange?: string;
}

export interface PortRangeParams extends RangeParams {
  port?: string;
}

export interface ProfitabilityParams extends RangeParams {
  mode: "port" | "segment";
  port?: string;
  segment?: string;
}

export const financeApi = {
  overview: (p: RangeParams = {}) => get<OverviewResponse>("/finance/overview", p),
  kpis: (p: RangeParams = {}) => get<KPI[]>("/finance/kpis", p),
  forex: (range: ForexRange = "week") => get<ForexResponse>("/finance/forex", { range }),
  revenue: (p: PortRangeParams = {}) => get<BreakdownResponse>("/finance/revenue", p),
  workingCapital: (p: PortRangeParams = {}) =>
    get<BreakdownResponse>("/finance/working-capital", p),
  profitability: (p: ProfitabilityParams) =>
    get<ProfitabilityResponse>("/finance/profitability", p),
  sales: (p: RangeParams = {}) => get<SalesResponse>("/finance/sales", p),
};
