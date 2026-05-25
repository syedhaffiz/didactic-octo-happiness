import { apiClient, unwrap } from "./client";
import { USE_MOCK_DATA, mockDelay } from "./dataSource";
import type { ApiEnvelope } from "../types/api";
import { GRADES, ORIGINS, PORTS, SEGMENTS, ZONES } from "../mocks/catalog";

const get = async <T>(path: string): Promise<T> => {
  const res = await apiClient.get<ApiEnvelope<T>>(path);
  return unwrap(res);
};

const httpFiltersApi = {
  ports: () => get<string[]>("/filters/ports"),
  segments: () => get<string[]>("/filters/segments"),
  zones: () => get<string[]>("/filters/zones"),
  grades: () => get<string[]>("/filters/grades"),
  origins: () => get<string[]>("/filters/origins"),
};

const mockFiltersApi = {
  ports: () => mockDelay<string[]>([...PORTS]),
  segments: () => mockDelay<string[]>([...SEGMENTS]),
  zones: () => mockDelay<string[]>([...ZONES]),
  grades: () => mockDelay<string[]>([...GRADES]),
  origins: () => mockDelay<string[]>([...ORIGINS]),
};

export const filtersApi = USE_MOCK_DATA ? mockFiltersApi : httpFiltersApi;
