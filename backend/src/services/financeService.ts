import { financeRepository } from "../repositories/financeRepository.js";
import type { ApprovedBudgetFilters, ForexRange } from "../types/finance.js";

export const financeService = {
  overview: (from: Date, to: Date) => financeRepository.getOverview(from, to),
  kpis: (from: Date, to: Date) => financeRepository.getKpis(from, to),
  forex: (range: ForexRange, anchor: Date) => financeRepository.getForex(range, anchor),
  revenue: (port: string | undefined, from: Date, to: Date) =>
    financeRepository.getRevenue(port, from, to),
  workingCapital: (port: string | undefined, from: Date, to: Date) =>
    financeRepository.getWorkingCapital(port, from, to),
  profitability: (
    mode: "port" | "segment",
    filter: string | undefined,
    from: Date,
    to: Date,
  ) => financeRepository.getProfitability(mode, filter, from, to),
  sales: (from: Date, to: Date) => financeRepository.getSales(from, to),
  approvedBudget: (filters: ApprovedBudgetFilters) =>
    financeRepository.getApprovedBudget(filters),
};
