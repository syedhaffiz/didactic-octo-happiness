import type {
  LogisticsFilters,
  LogisticsResponse,
  PdaDrilldownSeries,
} from "../types/logistics.js";
import { buildLogistics, buildPdaDrill } from "../mocks/logistics.js";

export interface LogisticsRepository {
  getOverview(filters: LogisticsFilters): Promise<LogisticsResponse>;
  getPdaDrill(path: string): Promise<PdaDrilldownSeries | null>;
}

class MockLogisticsRepository implements LogisticsRepository {
  async getOverview(filters: LogisticsFilters) {
    return buildLogistics(filters);
  }
  async getPdaDrill(path: string) {
    return buildPdaDrill(path);
  }
}

export const logisticsRepository: LogisticsRepository = new MockLogisticsRepository();
