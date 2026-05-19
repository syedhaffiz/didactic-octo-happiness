import { PORTS, SEGMENTS, ZONES } from "../mocks/catalog.js";

export interface FiltersRepository {
  getPorts(): Promise<string[]>;
  getSegments(): Promise<string[]>;
  getZones(): Promise<string[]>;
}

class MockFiltersRepository implements FiltersRepository {
  async getPorts() {
    return [...PORTS];
  }
  async getSegments() {
    return [...SEGMENTS];
  }
  async getZones() {
    return [...ZONES];
  }
}

export const filtersRepository: FiltersRepository = new MockFiltersRepository();
