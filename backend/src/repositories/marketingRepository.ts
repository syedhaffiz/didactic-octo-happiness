import type {
  MarketRange,
  IndexChart,
  IndexMovementResponse,
  MarketShareResponse,
  MarketShareFilters,
  OceanFreightResponse,
  OceanFreightFilters,
  TargetResponse,
  TargetFilters,
} from "../types/marketing.js";
import {
  buildIndexMovement,
  buildOneIndexChart,
  buildMarketShare,
  buildOceanFreight,
  buildTarget,
} from "../mocks/marketing.js";

export interface MarketingRepository {
  getIndices(range: MarketRange): Promise<IndexMovementResponse>;
  getIndex(code: string, range: MarketRange): Promise<IndexChart | null>;
  getMarketShare(filters: MarketShareFilters): Promise<MarketShareResponse>;
  getOceanFreight(filters: OceanFreightFilters): Promise<OceanFreightResponse>;
  getTarget(filters: TargetFilters): Promise<TargetResponse>;
}

class MockMarketingRepository implements MarketingRepository {
  async getIndices(range: MarketRange) {
    return buildIndexMovement(range);
  }
  async getIndex(code: string, range: MarketRange) {
    return buildOneIndexChart(code, range);
  }
  async getMarketShare(filters: MarketShareFilters) {
    return buildMarketShare(filters);
  }
  async getOceanFreight(filters: OceanFreightFilters) {
    return buildOceanFreight(filters);
  }
  async getTarget(filters: TargetFilters) {
    return buildTarget(filters);
  }
}

export const marketingRepository: MarketingRepository = new MockMarketingRepository();
