import { logisticsRepository } from "../repositories/logisticsRepository.js";
import type { LogisticsFilters } from "../types/logistics.js";

export const logisticsService = {
  vesselsSailed: (filters: LogisticsFilters) => logisticsRepository.getVesselsSailed(filters),
  handlingRates: () => logisticsRepository.getHandlingRates(),
  pda: () => logisticsRepository.getPda(),
  outstanding: () => logisticsRepository.getOutstanding(),
  pdaDrill: (path: string) => logisticsRepository.getPdaDrill(path),
};
