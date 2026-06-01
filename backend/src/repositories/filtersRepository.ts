import { GRADES, ORIGINS, PORTS, SEGMENTS, ZONES } from "../mocks/catalog.js";
import type { FiltersResponse } from "../types/api.js";

export interface FiltersRepository {
  getAll(): Promise<FiltersResponse>;
}

class MockFiltersRepository implements FiltersRepository {
  async getAll(): Promise<FiltersResponse> {
    return {
      ports: [...PORTS],
      segments: [...SEGMENTS],
      zones: [...ZONES],
      grades: [...GRADES],
      origins: [...ORIGINS],
    };
  }
}

export const filtersRepository: FiltersRepository = new MockFiltersRepository();
