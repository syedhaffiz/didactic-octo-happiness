import { logisticsRepository } from "../repositories/logisticsRepository.js";
import type { LogisticsFilters } from "../types/logistics.js";

export const logisticsService = {
  vesselsSailed: (filters: LogisticsFilters) => logisticsRepository.getVesselsSailed(filters),
  fiscalYears: () => logisticsRepository.getFiscalYears(),
  handlingRates: (year: string | undefined) => logisticsRepository.getHandlingRates(year),
  pda: (period: string | undefined) => logisticsRepository.getPda(period),
  pdaPeriods: () => logisticsRepository.getPdaPeriods(),
  outstanding: () => logisticsRepository.getOutstanding(),
};
