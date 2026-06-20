import { marketingRepository } from "../repositories/marketingRepository.js";
import type {
  IndexRange,
  MarketShareFilters,
  OceanFreightFilters,
  TargetFilters,
} from "../types/marketing.js";

export const marketingService = {
  indices: (range: IndexRange) => marketingRepository.getIndices(range),
  index: (code: string, range: IndexRange) => marketingRepository.getIndex(code, range),
  marketShare: (filters: MarketShareFilters) => marketingRepository.getMarketShare(filters),
  oceanFreight: (filters: OceanFreightFilters) => marketingRepository.getOceanFreight(filters),
  target: (filters: TargetFilters) => marketingRepository.getTarget(filters),
};
