import type {
  ApprovedBudgetFilters,
  ApprovedBudgetResponse,
  BatchDetailSearch,
  BreakdownResponse,
  Currency,
  ForexRange,
  ForexResponse,
  HandlingBatchDetailResponse,
  HandlingCategory,
  VesselHandlingSearch,
  VesselSalesSearch,
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
    zone: string | undefined,
    currency: Currency,
    from: Date,
    to: Date,
  ): Promise<NetMarginProfitabilityResponse>;
  getVesselSales(
    currency: Currency,
    from: Date,
    to: Date,
    search: VesselSalesSearch,
  ): Promise<VesselSalesResponse>;
  getVesselHandling(
    category: HandlingCategory,
    currency: Currency,
    from: Date,
    to: Date,
    search: VesselHandlingSearch,
  ): Promise<VesselHandlingResponse>;
  getSalesBatchDetail(
    batchId: string,
    search: BatchDetailSearch,
  ): Promise<SalesBatchDetailResponse>;
  getHandlingBatchDetail(
    batchId: string,
    search: BatchDetailSearch,
  ): Promise<HandlingBatchDetailResponse>;
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
    zone: string | undefined,
    currency: Currency,
    from: Date,
    to: Date,
  ) {
    return buildNetMarginProfitability(zone, currency, from, to);
  }
  async getVesselSales(
    currency: Currency,
    from: Date,
    to: Date,
    search: VesselSalesSearch,
  ) {
    return buildVesselSales(currency, from, to, search);
  }
  async getVesselHandling(
    category: HandlingCategory,
    currency: Currency,
    from: Date,
    to: Date,
    search: VesselHandlingSearch,
  ) {
    return buildVesselHandling(category, currency, from, to, search);
  }
  async getSalesBatchDetail(batchId: string, search: BatchDetailSearch) {
    return buildSalesBatchDetail(batchId, search);
  }
  async getHandlingBatchDetail(batchId: string, search: BatchDetailSearch) {
    return buildHandlingBatchDetail(batchId, search);
  }
  async getSales(from: Date, to: Date) {
    return buildSales(from, to);
  }
  async getApprovedBudget(filters: ApprovedBudgetFilters) {
    return buildApprovedBudget(filters);
  }
}

export const financeRepository: FinanceRepository = new MockFinanceRepository();
