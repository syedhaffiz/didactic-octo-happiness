import { apiClient, unwrap } from "./client";
import type { ApiEnvelope } from "../types/api";

const get = async <T>(path: string): Promise<T> => {
  const res = await apiClient.get<ApiEnvelope<T>>(path);
  return unwrap(res);
};

export const filtersApi = {
  ports: () => get<string[]>("/filters/ports"),
  segments: () => get<string[]>("/filters/segments"),
  zones: () => get<string[]>("/filters/zones"),
};
