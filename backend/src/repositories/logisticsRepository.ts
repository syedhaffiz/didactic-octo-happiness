import type {
  DpHandlingOutstanding,
  HandlingRatesResponse,
  LogisticsFilters,
  PdaDrilldownSeries,
  PdaRootPie,
  VesselsSailedResponse,
} from "../types/logistics.js";
import {
  buildHandlingRates,
  buildOutstanding,
  buildPdaDrill,
  buildPdaRoot,
  buildVesselsSailed,
} from "../mocks/logistics.js";

export interface LogisticsRepository {
  getVesselsSailed(filters: LogisticsFilters): Promise<VesselsSailedResponse>;
  getHandlingRates(): Promise<HandlingRatesResponse>;
  getPda(): Promise<PdaRootPie>;
  getOutstanding(): Promise<DpHandlingOutstanding>;
  getPdaDrill(path: string): Promise<PdaDrilldownSeries | null>;
}

class MockLogisticsRepository implements LogisticsRepository {
  async getVesselsSailed(filters: LogisticsFilters) {
    return { items: buildVesselsSailed(filters.fromDate, filters.toDate) };
  }
  async getHandlingRates() {
    return { items: buildHandlingRates() };
  }
  async getPda() {
    return buildPdaRoot();
  }
  async getOutstanding() {
    return buildOutstanding();
  }
  async getPdaDrill(path: string) {
    return buildPdaDrill(path);
  }
}

export const logisticsRepository: LogisticsRepository = new MockLogisticsRepository();
