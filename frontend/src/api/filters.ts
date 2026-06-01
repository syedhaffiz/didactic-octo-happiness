import { apiClient, unwrap } from "./client";
import { USE_MOCK_DATA, mockDelay } from "./dataSource";
import type { ApiEnvelope } from "../types/api";
import { GRADES, ORIGINS, PORTS, SEGMENTS, ZONES } from "../mocks/catalog";

// Matches backend FiltersResponse — every reference list the UI needs in
// one payload.
export interface FiltersResponse {
  ports: string[];
  segments: string[];
  zones: string[];
  grades: string[];
  origins: string[];
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
      ports: [...PORTS],
      segments: [...SEGMENTS],
      zones: [...ZONES],
      grades: [...GRADES],
      origins: [...ORIGINS],
    }),
};

export const filtersApi = USE_MOCK_DATA ? mockFiltersApi : httpFiltersApi;
