import type {
  IndexRange,
  IndexResponse,
  InventoryFilters,
  InventoryOverviewResponse,
  PriceIndex,
  VesselsResponse,
} from "../types/inventory.js";
import {
  buildIndices,
  buildInventoryOverview,
  buildOneIndex,
  buildVesselsSailedOut,
  buildVesselsUnderloading,
} from "../mocks/inventory.js";

export interface InventoryRepository {
  getIndices(range: IndexRange): Promise<IndexResponse>;
  getIndex(code: string, range: IndexRange): Promise<PriceIndex | null>;
  getOverview(filters: InventoryFilters): Promise<InventoryOverviewResponse>;
  getVesselsSailedOut(filters: InventoryFilters): Promise<VesselsResponse>;
  getVesselsUnderloading(filters: InventoryFilters): Promise<VesselsResponse>;
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
  async getVesselsSailedOut(filters: InventoryFilters) {
    return buildVesselsSailedOut(filters);
  }
  async getVesselsUnderloading(filters: InventoryFilters) {
    return buildVesselsUnderloading(filters);
  }
}

export const inventoryRepository: InventoryRepository = new MockInventoryRepository();
