import { apiClient, unwrap } from "./client";
import { USE_MOCK_DATA, mockDelay } from "./dataSource";
import type { ApiEnvelope } from "../types/api";
import type {
  IndexRange,
  IndexResponse,
  InventoryOverviewParams,
  InventoryOverviewResponse,
} from "../types/inventory";
import { buildIndices, buildInventoryOverview } from "../mocks/inventory";

// HTTP path – kept identical to what the backend will expose, so flipping
// `USE_MOCK_DATA` is the only change required to switch over.
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

const httpInventoryApi = {
  index: (range: IndexRange = "1M") => get<IndexResponse>("/inventory/index", { range }),
  overview: (p: InventoryOverviewParams = {}) =>
    get<InventoryOverviewResponse>("/inventory/overview", p),
};

const mockInventoryApi = {
  index: (range: IndexRange = "1M") => mockDelay(buildIndices(range)),
  overview: (p: InventoryOverviewParams = {}) => mockDelay(buildInventoryOverview(p)),
};

export const inventoryApi = USE_MOCK_DATA ? mockInventoryApi : httpInventoryApi;
