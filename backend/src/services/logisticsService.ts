import { logisticsRepository } from "../repositories/logisticsRepository.js";
import type { LogisticsFilters } from "../types/logistics.js";

export const logisticsService = {
  overview: (filters: LogisticsFilters) => logisticsRepository.getOverview(filters),
  pdaDrill: (path: string) => logisticsRepository.getPdaDrill(path),
};
