import type {
  DpHandlingOutstanding,
  FiscalYearResponse,
  HandlingRatesResponse,
  LogisticsFilters,
  PdaDrilldownSeries,
  PdaRootPie,
  VesselsSailedResponse,
} from "../types/logistics.js";
import {
  buildFiscalYears,
  buildHandlingRates,
  buildOutstanding,
  buildPdaDrill,
  buildPdaRoot,
  buildVesselsSailed,
} from "../mocks/logistics.js";

export interface LogisticsRepository {
  getVesselsSailed(filters: LogisticsFilters): Promise<VesselsSailedResponse>;
  getFiscalYears(): Promise<FiscalYearResponse>;
  getHandlingRates(year: string | undefined): Promise<HandlingRatesResponse>;
  getPda(): Promise<PdaRootPie>;
  getOutstanding(): Promise<DpHandlingOutstanding>;
  getPdaDrill(path: string): Promise<PdaDrilldownSeries | null>;
}

class MockLogisticsRepository implements LogisticsRepository {
  async getVesselsSailed(filters: LogisticsFilters) {
    return { items: buildVesselsSailed(filters.fromDate, filters.toDate) };
  }
  async getFiscalYears() {
    return { fiscalYear: buildFiscalYears() };
  }
  async getHandlingRates(year: string | undefined) {
    return { items: buildHandlingRates(year) };
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
