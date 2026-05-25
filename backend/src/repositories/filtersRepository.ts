import { GRADES, ORIGINS, PORTS, SEGMENTS, ZONES } from "../mocks/catalog.js";

export interface FiltersRepository {
  getPorts(): Promise<string[]>;
  getSegments(): Promise<string[]>;
  getZones(): Promise<string[]>;
  getGrades(): Promise<string[]>;
  getOrigins(): Promise<string[]>;
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
  async getGrades() {
    return [...GRADES];
  }
  async getOrigins() {
    return [...ORIGINS];
  }
}

export const filtersRepository: FiltersRepository = new MockFiltersRepository();
