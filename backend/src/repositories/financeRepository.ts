import type {
  ApprovedBudgetFilters,
  ApprovedBudgetResponse,
  BreakdownResponse,
  ForexRange,
  ForexResponse,
  KPI,
  OverviewResponse,
  ProfitabilityResponse,
  SalesResponse,
} from "../types/finance.js";
import { buildKpis } from "../mocks/kpis.js";
import { buildForex } from "../mocks/forex.js";
import { buildBreakdown } from "../mocks/breakdown.js";
import { buildProfitability } from "../mocks/profitability.js";
import { buildSales } from "../mocks/sales.js";
import { buildApprovedBudget } from "../mocks/approvedBudget.js";

export interface FinanceRepository {
  getKpis(from: Date, to: Date): Promise<KPI[]>;
  getForex(range: ForexRange, anchor: Date): Promise<ForexResponse>;
  getOverview(from: Date, to: Date): Promise<OverviewResponse>;
  getRevenue(port: string | undefined, from: Date, to: Date): Promise<BreakdownResponse>;
  getWorkingCapital(port: string | undefined, from: Date, to: Date): Promise<BreakdownResponse>;
  getProfitability(
    mode: "port" | "segment",
    filter: string | undefined,
    from: Date,
    to: Date,
  ): Promise<ProfitabilityResponse>;
  getSales(from: Date, to: Date): Promise<SalesResponse>;
  getApprovedBudget(filters: ApprovedBudgetFilters): Promise<ApprovedBudgetResponse>;
}

class MockFinanceRepository implements FinanceRepository {
  async getKpis(from: Date, to: Date) {
    return buildKpis(from, to);
  }
  async getForex(range: ForexRange, anchor: Date) {
    return buildForex(range, anchor);
  }
  async getOverview(from: Date, to: Date) {
    return {
      kpis: buildKpis(from, to),
      forex: buildForex("week", to),
    };
  }
  async getRevenue(port: string | undefined, from: Date, to: Date) {
    return buildBreakdown("revenue", port, from, to);
  }
  async getWorkingCapital(port: string | undefined, from: Date, to: Date) {
    return buildBreakdown("working-capital", port, from, to);
  }
  async getProfitability(
    mode: "port" | "segment",
    filter: string | undefined,
    from: Date,
    to: Date,
  ) {
    return buildProfitability(mode, filter, from, to);
  }
  async getSales(from: Date, to: Date) {
    return buildSales(from, to);
  }
  async getApprovedBudget(filters: ApprovedBudgetFilters) {
    return buildApprovedBudget(filters);
  }
}

// The active implementation is selected here. When DATA_SOURCE=databricks lands,
// a DatabricksFinanceRepository will be returned instead and nothing upstream changes.
export const financeRepository: FinanceRepository = new MockFinanceRepository();
