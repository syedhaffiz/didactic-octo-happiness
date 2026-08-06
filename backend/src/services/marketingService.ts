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
  // Market Share — thin pass-through, one per card.
  marketShareSplit: (f: MarketShareFilters) => marketingRepository.getMarketShareSplit(f),
  marketShareImportQuantity: (f: MarketShareFilters) =>
    marketingRepository.getMarketShareImportQuantity(f),
  marketShareByCategory: (f: MarketShareFilters) => marketingRepository.getMarketShareByCategory(f),
  marketShareQuarterwise: (f: MarketShareFilters) =>
    marketingRepository.getMarketShareQuarterwise(f),
  marketShareIndustrywise: (f: MarketShareFilters) =>
    marketingRepository.getMarketShareIndustrywise(f),
  marketShareOriginwise: (f: MarketShareFilters) => marketingRepository.getMarketShareOriginwise(f),
  marketSharePortwise: (f: MarketShareFilters) => marketingRepository.getMarketSharePortwise(f),
  marketShareFilterOptions: () => marketingRepository.getMarketShareFilterOptions(),
  oceanFreight: (filters: OceanFreightFilters) => marketingRepository.getOceanFreight(filters),
  target: (filters: TargetFilters) => marketingRepository.getTarget(filters),
};
