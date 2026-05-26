import { inventoryRepository } from "../repositories/inventoryRepository.js";
import type { IndexRange, InventoryFilters } from "../types/inventory.js";

export const inventoryService = {
  indices: (range: IndexRange) => inventoryRepository.getIndices(range),
  index: (code: string, range: IndexRange) => inventoryRepository.getIndex(code, range),
  overview: (filters: InventoryFilters) => inventoryRepository.getOverview(filters),
};
