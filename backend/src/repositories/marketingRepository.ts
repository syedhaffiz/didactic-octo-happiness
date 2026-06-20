import type {
  IndexRange,
  IndexChart,
  IndexMovementResponse,
  MarketShareResponse,
  MarketShareFilters,
  MarketShareDimension,
  MarketShareDrilldownSeries,
  OceanFreightResponse,
  OceanFreightFilters,
  TargetResponse,
  TargetFilters,
} from "../types/marketing.js";
import {
  buildIndexMovement,
  buildOneIndexChart,
  buildMarketShare,
  buildMarketShareDrill,
  buildOceanFreight,
  buildTarget,
} from "../mocks/marketing.js";

export interface MarketingRepository {
  getIndices(range: IndexRange): Promise<IndexMovementResponse>;
  getIndex(code: string, range: IndexRange): Promise<IndexChart | null>;
  getMarketShare(filters: MarketShareFilters): Promise<MarketShareResponse>;
  getMarketShareDrill(
    dim: MarketShareDimension,
    path: string,
  ): Promise<MarketShareDrilldownSeries | null>;
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
  async getMarketShare(filters: MarketShareFilters) {
    return buildMarketShare(filters);
  }
  async getMarketShareDrill(dim: MarketShareDimension, path: string) {
    return buildMarketShareDrill(dim, path);
  }
  async getOceanFreight(filters: OceanFreightFilters) {
    return buildOceanFreight(filters);
  }
  async getTarget(filters: TargetFilters) {
    return buildTarget(filters);
  }
}

export const marketingRepository: MarketingRepository = new MockMarketingRepository();
