import {
  DISCHARGE_PORT_LIST,
  GRADE_LIST,
  INDEX_NAME_LIST,
  ORIGIN_LIST,
  PORT_LIST,
  portsForZone,
  SEGMENT_LIST,
  ZONE_LIST,
} from "../mocks/catalog.js";
import type { FilterRef, FiltersResponse } from "../types/api.js";

export interface FiltersRepository {
  getAll(): Promise<FiltersResponse>;
  getPortsByZone(zone: string | undefined): Promise<FilterRef[]>;
}

class MockFiltersRepository implements FiltersRepository {
  async getAll(): Promise<FiltersResponse> {
    return {
      ports: [...PORT_LIST],
      dischargePorts: [...DISCHARGE_PORT_LIST],
      segments: [...SEGMENT_LIST],
      zones: [...ZONE_LIST],
      origins: [...ORIGIN_LIST],
      grades: [...GRADE_LIST],
      indexNames: [...INDEX_NAME_LIST],
    };
  }

  async getPortsByZone(zone: string | undefined): Promise<FilterRef[]> {
    return portsForZone(zone);
  }
}

export const filtersRepository: FiltersRepository = new MockFiltersRepository();
