import type {
  IndexRange,
  IndexChart,
  IndexMovementResponse,
  MarketShareFilters,
  MarketShareFilterOptions,
  MarketSharePairedResponse,
  MarketShareQuarterwiseResponse,
  MarketShareSplitResponse,
  OceanFreightResponse,
  OceanFreightFilters,
  TargetResponse,
  TargetFilters,
} from "../types/marketing.js";
import {
  buildIndexMovement,
  buildOneIndexChart,
  buildMarketShareSplit,
  buildImportQuantity,
  buildByCategory,
  buildQuarterwise,
  buildIndustrywise,
  buildOriginwise,
  buildPortwise,
  buildMarketShareFilterOptions,
  buildOceanFreight,
  buildTarget,
} from "../mocks/marketing.js";

export interface MarketingRepository {
  getIndices(range: IndexRange): Promise<IndexMovementResponse>;
  getIndex(code: string, range: IndexRange): Promise<IndexChart | null>;
  // Market Share — one method per card, all sharing the filter query.
  getMarketShareSplit(filters: MarketShareFilters): Promise<MarketShareSplitResponse>;
  getMarketShareImportQuantity(filters: MarketShareFilters): Promise<MarketSharePairedResponse>;
  getMarketShareByCategory(filters: MarketShareFilters): Promise<MarketSharePairedResponse>;
  getMarketShareQuarterwise(filters: MarketShareFilters): Promise<MarketShareQuarterwiseResponse>;
  getMarketShareIndustrywise(filters: MarketShareFilters): Promise<MarketSharePairedResponse>;
  getMarketShareOriginwise(filters: MarketShareFilters): Promise<MarketSharePairedResponse>;
  getMarketSharePortwise(filters: MarketShareFilters): Promise<MarketSharePairedResponse>;
  getMarketShareFilterOptions(): Promise<MarketShareFilterOptions>;
  getOceanFreight(filters: OceanFreightFilters): Promise<OceanFreightResponse>;
  getTarget(filters: TargetFilters): Promise<TargetResponse>;
}

class MockMarketingRepository implements MarketingRepository {
  async getIndices(range: IndexRange) {
    return buildIndexMovement(range);
  }
  async getIndex(code: string, range: IndexRange) {
    return buildOneIndexChart(code, range);
  }
  async getMarketShareSplit(filters: MarketShareFilters) {
    return buildMarketShareSplit(filters);
  }
  async getMarketShareImportQuantity(filters: MarketShareFilters) {
    return buildImportQuantity(filters);
  }
  async getMarketShareByCategory(filters: MarketShareFilters) {
    return buildByCategory(filters);
  }
  async getMarketShareQuarterwise(filters: MarketShareFilters) {
    return buildQuarterwise(filters);
  }
  async getMarketShareIndustrywise(filters: MarketShareFilters) {
    return buildIndustrywise(filters);
  }
  async getMarketShareOriginwise(filters: MarketShareFilters) {
    return buildOriginwise(filters);
  }
  async getMarketSharePortwise(filters: MarketShareFilters) {
    return buildPortwise(filters);
  }
  async getMarketShareFilterOptions() {
    return buildMarketShareFilterOptions();
  }
  async getOceanFreight(filters: OceanFreightFilters) {
    return buildOceanFreight(filters);
  }
  async getTarget(filters: TargetFilters) {
    return buildTarget(filters);
  }
}

export const marketingRepository: MarketingRepository = new MockMarketingRepository();
