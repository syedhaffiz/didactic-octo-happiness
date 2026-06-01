import {
  GRADE_LIST,
  INDEX_NAME_LIST,
  ORIGIN_LIST,
  PORT_LIST,
  SEGMENT_LIST,
  ZONE_LIST,
} from "../mocks/catalog.js";
import type { FiltersResponse } from "../types/api.js";

export interface FiltersRepository {
  getAll(): Promise<FiltersResponse>;
}

class MockFiltersRepository implements FiltersRepository {
  async getAll(): Promise<FiltersResponse> {
    return {
      ports: [...PORT_LIST],
      segments: [...SEGMENT_LIST],
      zones: [...ZONE_LIST],
      origins: [...ORIGIN_LIST],
      grades: [...GRADE_LIST],
      indexNames: [...INDEX_NAME_LIST],
    };
  }
}

export const filtersRepository: FiltersRepository = new MockFiltersRepository();
