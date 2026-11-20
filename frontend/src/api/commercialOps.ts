import { apiClient, unwrap } from "./client";
import { USE_MOCK_DATA, mockDelay } from "./dataSource";
import type { ApiEnvelope } from "../types/api";
import type {
  ContractsFilterOptions,
  ContractsFilters,
  ContractsOverview,
  ContractsResponse,
} from "../types/commercialOps";
import {
  buildContracts,
  buildContractsOverview,
  buildContractsFilterOptions,
} from "../mocks/commercialOps";

// Three endpoints back the Contracts screens:
//   • filterOptions — zones / ports / segments for the overview filter row
//   • overview      — all three overview cards (status, port-wise, EMD aging)
//   • contracts     — the Contract Details table rows
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

const httpCommercialOpsApi = {
  contractsFilterOptions: () =>
    get<ContractsFilterOptions>("/commercial-ops/contracts/filters"),
  contractsOverview: (f: ContractsFilters = {}) =>
    get<ContractsOverview>("/commercial-ops/contracts/overview", f),
  contracts: (f: ContractsFilters = {}) =>
    get<ContractsResponse>("/commercial-ops/contracts", f),
};

const mockCommercialOpsApi = {
  contractsFilterOptions: () => mockDelay(buildContractsFilterOptions()),
  contractsOverview: (f: ContractsFilters = {}) => mockDelay(buildContractsOverview(f)),
  contracts: (f: ContractsFilters = {}) => mockDelay(buildContracts(f)),
};

export const commercialOpsApi = USE_MOCK_DATA ? mockCommercialOpsApi : httpCommercialOpsApi;
