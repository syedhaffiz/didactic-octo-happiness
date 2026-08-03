import type {
  DpHandlingOutstanding,
  FiscalYearResponse,
  HandlingRatesResponse,
  LogisticsFilters,
  PdaPeriodResponse,
  PdaResponse,
  VesselsSailedResponse,
} from "../types/logistics.js";
import {
  buildFiscalYears,
  buildHandlingRates,
  buildOutstanding,
  buildPda,
  buildPdaPeriods,
  buildVesselsSailed,
} from "../mocks/logistics.js";

export interface LogisticsRepository {
  getVesselsSailed(filters: LogisticsFilters): Promise<VesselsSailedResponse>;
  getFiscalYears(): Promise<FiscalYearResponse>;
  getHandlingRates(year: string | undefined): Promise<HandlingRatesResponse>;
  getPda(period: string | undefined): Promise<PdaResponse>;
  getPdaPeriods(): Promise<PdaPeriodResponse>;
  getOutstanding(): Promise<DpHandlingOutstanding>;
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
  async getPda(period: string | undefined) {
    return { items: buildPda(period) };
  }
  async getPdaPeriods() {
    return { period: buildPdaPeriods() };
  }
  async getOutstanding() {
    return buildOutstanding();
  }
}

export const logisticsRepository: LogisticsRepository = new MockLogisticsRepository();
