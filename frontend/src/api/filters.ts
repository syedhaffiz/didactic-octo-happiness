import { apiClient, unwrap } from "./client";
import { USE_MOCK_DATA, mockDelay } from "./dataSource";
import type { ApiEnvelope } from "../types/api";
import {
  GRADE_LIST,
  INDEX_NAME_LIST,
  ORIGIN_LIST,
  PORT_LIST,
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
  segments: FilterRef[];
  zones: FilterRef[];
  origins: FilterRef[];
  grades: GradeRef[];
  indexNames: IndexNameRef[];
}

const get = async <T>(path: string): Promise<T> => {
  const res = await apiClient.get<ApiEnvelope<T>>(path);
  return unwrap(res);
};

const httpFiltersApi = {
  all: () => get<FiltersResponse>("/filters"),
};

const mockFiltersApi = {
  all: (): Promise<FiltersResponse> =>
    mockDelay({
      ports: [...PORT_LIST],
      segments: [...SEGMENT_LIST],
      zones: [...ZONE_LIST],
      origins: [...ORIGIN_LIST],
      grades: [...GRADE_LIST],
      indexNames: [...INDEX_NAME_LIST],
    }),
};

export const filtersApi = USE_MOCK_DATA ? mockFiltersApi : httpFiltersApi;
