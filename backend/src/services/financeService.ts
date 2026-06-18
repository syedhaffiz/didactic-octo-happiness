import { financeRepository } from "../repositories/financeRepository.js";
import type { ApprovedBudgetFilters, Currency, ForexRange } from "../types/finance.js";

export const financeService = {
  overview: (from: Date, to: Date) => financeRepository.getOverview(from, to),
  kpis: (from: Date, to: Date) => financeRepository.getKpis(from, to),
  forex: (range: ForexRange, anchor: Date) => financeRepository.getForex(range, anchor),
  revenue: (port: string | undefined, from: Date, to: Date) =>
    financeRepository.getRevenue(port, from, to),
  workingCapital: (port: string | undefined, from: Date, to: Date) =>
    financeRepository.getWorkingCapital(port, from, to),
  netMarginProfitability: (
    port: string | undefined,
    currency: Currency,
    from: Date,
    to: Date,
  ) => financeRepository.getNetMarginProfitability(port, currency, from, to),
  vesselSales: (port: string | undefined, from: Date, to: Date) =>
    financeRepository.getVesselSales(port, from, to),
  vesselHandling: (port: string | undefined, from: Date, to: Date) =>
    financeRepository.getVesselHandling(port, from, to),
  salesBatchDetail: (batchId: string) => financeRepository.getSalesBatchDetail(batchId),
  handlingBatchDetail: (batchId: string) => financeRepository.getHandlingBatchDetail(batchId),
  sales: (from: Date, to: Date) => financeRepository.getSales(from, to),
  approvedBudget: (filters: ApprovedBudgetFilters) =>
    financeRepository.getApprovedBudget(filters),
};
