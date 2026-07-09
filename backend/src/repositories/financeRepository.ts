import type {
  ApprovedBudgetFilters,
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
  RevenuePortResponse,
  RevenueSegmentResponse,
  SalesBatchDetailResponse,
  SalesResponse,
  VesselHandlingResponse,
  VesselSalesResponse,
} from "../types/finance.js";
import { buildKpis } from "../mocks/kpis.js";
import { buildForex } from "../mocks/forex.js";
import { buildBreakdown } from "../mocks/breakdown.js";
import {
  buildHandlingBatchDetail,
  buildNetMarginProfitability,
  buildSalesBatchDetail,
  buildVesselHandling,
  buildVesselSales,
} from "../mocks/profitability.js";
import {
  buildRevenueBreakdown,
  buildRevenuePort,
  buildRevenueSegment,
} from "../mocks/revenue.js";
import { buildSales } from "../mocks/sales.js";
import { buildApprovedBudget } from "../mocks/approvedBudget.js";

export interface FinanceRepository {
  getKpis(from: Date, to: Date): Promise<KPI[]>;
  getForex(range: ForexRange, anchor: Date): Promise<ForexResponse>;
  getOverview(from: Date, to: Date): Promise<OverviewResponse>;
  getRevenueBreakdown(
    from: Date,
    to: Date,
    zone: string | undefined,
    port: string | undefined,
    currency: Currency,
  ): Promise<RevenueBreakdownResponse>;
  getRevenuePort(port: string | undefined): Promise<RevenuePortResponse>;
  getRevenueSegment(segment: string | undefined): Promise<RevenueSegmentResponse>;
  getWorkingCapital(port: string | undefined, from: Date, to: Date): Promise<BreakdownResponse>;
  // --- New Profitability suite ---
  getNetMarginProfitability(
    port: string | undefined,
    currency: Currency,
    from: Date,
    to: Date,
  ): Promise<NetMarginProfitabilityResponse>;
  getVesselSales(port: string | undefined, from: Date, to: Date): Promise<VesselSalesResponse>;
  getVesselHandling(port: string | undefined, from: Date, to: Date): Promise<VesselHandlingResponse>;
  getSalesBatchDetail(batchId: string): Promise<SalesBatchDetailResponse>;
  getHandlingBatchDetail(batchId: string): Promise<HandlingBatchDetailResponse>;
  // --- Unchanged ---
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
  async getRevenueBreakdown(
    from: Date,
    to: Date,
    zone: string | undefined,
    port: string | undefined,
    currency: Currency,
  ) {
    return buildRevenueBreakdown(from, to, zone, port, currency);
  }
  async getRevenuePort(port: string | undefined) {
    return buildRevenuePort(port);
  }
  async getRevenueSegment(segment: string | undefined) {
    return buildRevenueSegment(segment);
  }
  async getWorkingCapital(port: string | undefined, from: Date, to: Date) {
    return buildBreakdown("working-capital", port, from, to);
  }
  async getNetMarginProfitability(
    port: string | undefined,
    currency: Currency,
    from: Date,
    to: Date,
  ) {
    return buildNetMarginProfitability(port, currency, from, to);
  }
  async getVesselSales(port: string | undefined, from: Date, to: Date) {
    return buildVesselSales(port, from, to);
  }
  async getVesselHandling(port: string | undefined, from: Date, to: Date) {
    return buildVesselHandling(port, from, to);
  }
  async getSalesBatchDetail(batchId: string) {
    return buildSalesBatchDetail(batchId);
  }
  async getHandlingBatchDetail(batchId: string) {
    return buildHandlingBatchDetail(batchId);
  }
  async getSales(from: Date, to: Date) {
    return buildSales(from, to);
  }
  async getApprovedBudget(filters: ApprovedBudgetFilters) {
    return buildApprovedBudget(filters);
  }
}

export const financeRepository: FinanceRepository = new MockFinanceRepository();
