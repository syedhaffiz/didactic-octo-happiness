import { apiClient, unwrap } from "./client";
import { USE_MOCK_DATA, mockDelay } from "./dataSource";
import type { ApiEnvelope } from "../types/api";
import {
  DISCHARGE_PORT_LIST,
  GRADE_LIST,
  INDEX_NAME_LIST,
  ORIGIN_LIST,
  PORT_LIST,
  portsForZone,
  SEGMENT_LIST,
  ZONE_LIST,
} from "../mocks/catalog";

// Matches backend FiltersResponse. Each filter is an object so the frontend
// keeps the id (stable, sent to the API) separate from the name (display).
export interface FilterRef {
  id: string;
  name: string;
}
export interface GradeRef extends FilterRef {
  group_name: string;
}
export interface IndexNameRef {
  index_name: string; // short slug, e.g. "api4"
  code_id: string; // display code, e.g. "API 4"
}

export interface FiltersResponse {
  ports: FilterRef[];
  dischargePorts: FilterRef[];
  segments: FilterRef[];
  zones: FilterRef[];
  origins: FilterRef[];
  grades: GradeRef[];
  indexNames: IndexNameRef[];
}

const get = async <T>(
  path: string,
  params?: Record<string, string | undefined>,
): Promise<T> => {
  const res = await apiClient.get<ApiEnvelope<T>>(path, { params });
  return unwrap(res);
};

const httpFiltersApi = {
  all: () => get<FiltersResponse>("/filters"),
  portsByZone: (zone: string) => get<FilterRef[]>("/filters/ports", { zone }),
};

const mockFiltersApi = {
  all: (): Promise<FiltersResponse> =>
    mockDelay({
      ports: [...PORT_LIST],
      dischargePorts: [...DISCHARGE_PORT_LIST],
      segments: [...SEGMENT_LIST],
      zones: [...ZONE_LIST],
      origins: [...ORIGIN_LIST],
      grades: [...GRADE_LIST],
      indexNames: [...INDEX_NAME_LIST],
    }),
  portsByZone: (zone: string): Promise<FilterRef[]> => mockDelay(portsForZone(zone)),
};

export const filtersApi = USE_MOCK_DATA ? mockFiltersApi : httpFiltersApi;
