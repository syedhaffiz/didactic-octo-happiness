import { apiClient, unwrap } from "./client";
import type { ApiEnvelope } from "../types/api";
import type {
  IndexRange,
  IndexResponse,
  InventoryOverviewParams,
  InventoryOverviewResponse,
} from "../types/inventory";

const get = async <T>(
  path: string,
  params?: Record<string, string | undefined> | object,
): Promise<T> => {
  const clean = params
    ? Object.fromEntries(
        Object.entries(params as Record<string, string | undefined>).filter(
          ([, v]) => v !== undefined && v !== "",
        ),
      )
    : undefined;
  const res = await apiClient.get<ApiEnvelope<T>>(path, { params: clean });
  return unwrap(res);
};

export const inventoryApi = {
  index: (range: IndexRange = "1M") => get<IndexResponse>("/inventory/index", { range }),
  overview: (p: InventoryOverviewParams = {}) =>
    get<InventoryOverviewResponse>("/inventory/overview", p),
};
