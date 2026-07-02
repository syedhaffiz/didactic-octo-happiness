import { logisticsRepository } from "../repositories/logisticsRepository.js";
import type { LogisticsFilters } from "../types/logistics.js";

export const logisticsService = {
  vesselsSailed: (filters: LogisticsFilters) => logisticsRepository.getVesselsSailed(filters),
  fiscalYears: () => logisticsRepository.getFiscalYears(),
  handlingRates: (year: string | undefined) => logisticsRepository.getHandlingRates(year),
  pda: () => logisticsRepository.getPda(),
  outstanding: () => logisticsRepository.getOutstanding(),
  pdaDrill: (path: string) => logisticsRepository.getPdaDrill(path),
};
