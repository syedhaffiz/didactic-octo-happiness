import type {
  IndexRange,
  IndexResponse,
  InventoryFilters,
  InventoryOverviewResponse,
  PriceIndex,
} from "../types/inventory.js";
import {
  buildIndices,
  buildInventoryOverview,
  buildOneIndex,
} from "../mocks/inventory.js";

export interface InventoryRepository {
  getIndices(range: IndexRange): Promise<IndexResponse>;
  getIndex(code: string, range: IndexRange): Promise<PriceIndex | null>;
  getOverview(filters: InventoryFilters): Promise<InventoryOverviewResponse>;
}

class MockInventoryRepository implements InventoryRepository {
  async getIndices(range: IndexRange) {
    return buildIndices(range);
  }
  async getIndex(code: string, range: IndexRange) {
    return buildOneIndex(code, range);
  }
  async getOverview(filters: InventoryFilters) {
    return buildInventoryOverview(filters);
  }
}

export const inventoryRepository: InventoryRepository = new MockInventoryRepository();
