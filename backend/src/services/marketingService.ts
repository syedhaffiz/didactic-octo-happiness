import { marketingRepository } from "../repositories/marketingRepository.js";
import type {
  MarketRange,
  MarketShareFilters,
  OceanFreightFilters,
  TargetFilters,
} from "../types/marketing.js";

export const marketingService = {
  indices: (range: MarketRange) => marketingRepository.getIndices(range),
  index: (code: string, range: MarketRange) => marketingRepository.getIndex(code, range),
  marketShare: (filters: MarketShareFilters) => marketingRepository.getMarketShare(filters),
  oceanFreight: (filters: OceanFreightFilters) => marketingRepository.getOceanFreight(filters),
  target: (filters: TargetFilters) => marketingRepository.getTarget(filters),
};
