import { apiClient, unwrap } from "./client";
import { USE_MOCK_DATA, mockDelay } from "./dataSource";
import type { ApiEnvelope } from "../types/api";
import type {
  PlotRentByPortResponse,
  PlotRentEntriesResponse,
  PlotRentFilters,
} from "../types/plotRent";
import { buildPlotRentByPort, buildPlotRentEntries } from "../mocks/plotRent";

// Two endpoints back the Plot Rent screen:
//   • byPort  — the "Plot Rent by Port" chart card
//   • entries — the ledger table
// The Zone / Port dropdowns reuse the Contracts filters API
// (commercialOpsApi.contractsFilterOptions) — there is no separate one here.
//
// HTTP paths are the planned backend routes, so flipping USE_MOCK_DATA is the
// only change required once the endpoints exist.
const get = async <T>(path: string, params?: object): Promise<T> => {
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

const httpPlotRentApi = {
  byPort: (f: PlotRentFilters = {}) =>
    get<PlotRentByPortResponse>("/commercial-ops/plot-rent/by-port", f),
  entries: (f: PlotRentFilters = {}) =>
    get<PlotRentEntriesResponse>("/commercial-ops/plot-rent/entries", f),
};

const mockPlotRentApi = {
  byPort: (f: PlotRentFilters = {}) => mockDelay(buildPlotRentByPort(f)),
  entries: (f: PlotRentFilters = {}) => mockDelay(buildPlotRentEntries(f)),
};

export const plotRentApi = USE_MOCK_DATA ? mockPlotRentApi : httpPlotRentApi;
