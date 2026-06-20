import { marketingRepository } from "../repositories/marketingRepository.js";
import type {
  IndexRange,
  MarketShareFilters,
  MarketShareDimension,
  OceanFreightFilters,
  TargetFilters,
} from "../types/marketing.js";

export const marketingService = {
  indices: (range: IndexRange) => marketingRepository.getIndices(range),
  index: (code: string, range: IndexRange) => marketingRepository.getIndex(code, range),
  marketShare: (filters: MarketShareFilters) => marketingRepository.getMarketShare(filters),
  marketShareDrill: (dim: MarketShareDimension, path: string) =>
    marketingRepository.getMarketShareDrill(dim, path),
  oceanFreight: (filters: OceanFreightFilters) => marketingRepository.getOceanFreight(filters),
  target: (filters: TargetFilters) => marketingRepository.getTarget(filters),
};
