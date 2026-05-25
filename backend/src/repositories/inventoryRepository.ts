import type {
  IndexRange,
  IndexResponse,
  InventoryFilters,
  InventoryOverviewResponse,
} from "../types/inventory.js";
import { buildIndices, buildInventoryOverview } from "../mocks/inventory.js";

export interface InventoryRepository {
  getIndices(range: IndexRange): Promise<IndexResponse>;
  getOverview(filters: InventoryFilters): Promise<InventoryOverviewResponse>;
}

class MockInventoryRepository implements InventoryRepository {
  async getIndices(range: IndexRange) {
    return buildIndices(range);
  }
  async getOverview(filters: InventoryFilters) {
    return buildInventoryOverview(filters);
  }
}

export const inventoryRepository: InventoryRepository = new MockInventoryRepository();
