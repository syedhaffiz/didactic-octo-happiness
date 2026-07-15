import { financeRepository } from "../repositories/financeRepository.js";
import type {
  ApprovedBudgetFilters,
  BatchDetailSearch,
  Currency,
  ForexRange,
  HandlingCategory,
  VesselHandlingSearch,
  VesselSalesSearch,
} from "../types/finance.js";

export const financeService = {
  overview: (from: Date, to: Date) => financeRepository.getOverview(from, to),
  kpis: (from: Date, to: Date) => financeRepository.getKpis(from, to),
  forex: (range: ForexRange, anchor: Date) => financeRepository.getForex(range, anchor),
  revenueBreakdown: (
    from: Date,
    to: Date,
    zone: string | undefined,
    port: string | undefined,
    currency: Currency,
  ) => financeRepository.getRevenueBreakdown(from, to, zone, port, currency),
  revenuePort: (port: string | undefined) => financeRepository.getRevenuePort(port),
  revenueSegment: (segment: string | undefined) => financeRepository.getRevenueSegment(segment),
  workingCapital: (port: string | undefined, from: Date, to: Date) =>
    financeRepository.getWorkingCapital(port, from, to),
  netMarginProfitability: (
    zone: string | undefined,
    currency: Currency,
    from: Date,
    to: Date,
  ) => financeRepository.getNetMarginProfitability(zone, currency, from, to),
  vesselSales: (currency: Currency, from: Date, to: Date, search: VesselSalesSearch) =>
    financeRepository.getVesselSales(currency, from, to, search),
  vesselHandling: (
    category: HandlingCategory,
    currency: Currency,
    from: Date,
    to: Date,
    search: VesselHandlingSearch,
  ) => financeRepository.getVesselHandling(category, currency, from, to, search),
  salesBatchDetail: (batchId: string, search: BatchDetailSearch) =>
    financeRepository.getSalesBatchDetail(batchId, search),
  handlingBatchDetail: (batchId: string, search: BatchDetailSearch) =>
    financeRepository.getHandlingBatchDetail(batchId, search),
  sales: (from: Date, to: Date) => financeRepository.getSales(from, to),
  approvedBudget: (filters: ApprovedBudgetFilters) =>
    financeRepository.getApprovedBudget(filters),
};
