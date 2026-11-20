import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import type { Dayjs } from "dayjs";
import { useUrlDateRange } from "./useUrlParam";
import type { ContractsFilters } from "../types/commercialOps";

const DATE_FMT = "YYYY-MM-DD";

// Every Contracts filter lives in the URL, so the overview → details drill-down
// is just a navigation that carries the query string along (and both screens
// survive a reload / shared link).
export const CONTRACT_FILTER_KEYS = ["zone", "port", "segment", "status", "emd"] as const;
export type ContractFilterKey = (typeof CONTRACT_FILTER_KEYS)[number];

export interface ContractsFilterState {
  zone: string | undefined;
  port: string | undefined;
  segment: string | undefined;
  status: string | undefined;
  /** "pending" when narrowed to contracts with a pending EMD. */
  emd: "pending" | undefined;
  /** Picker value — null when no range is set (the design's "From – To Date"). */
  dateValue: [Dayjs, Dayjs] | null;
  /** API params (undefined values are dropped before the request). */
  params: ContractsFilters;
  setValue: (key: ContractFilterKey, v: string | undefined) => void;
  setDateRange: (v: [Dayjs | null, Dayjs | null] | null) => void;
  /** Current query string ("" or "?…"), for carrying filters across pages. */
  search: string;
  clearAll: () => void;
}

export const useContractsFilters = (): ContractsFilterState => {
  const [params, setParams] = useSearchParams();
  const [range, setDateRange] = useUrlDateRange();

  const read = (k: string) => params.get(k) || undefined;
  const zone = read("zone");
  const port = read("port");
  const segment = read("segment");
  const status = read("status");
  const emd = read("emd") === "pending" ? ("pending" as const) : undefined;

  const setValue = useCallback(
    (key: ContractFilterKey, next: string | undefined) =>
      setParams(
        (prev) => {
          const out = new URLSearchParams(prev);
          if (next) out.set(key, next);
          else out.delete(key);
          return out;
        },
        { replace: true },
      ),
    [setParams],
  );

  const clearAll = useCallback(() => setParams({}, { replace: true }), [setParams]);

  const fromDate = range?.[0]?.format(DATE_FMT);
  const toDate = range?.[1]?.format(DATE_FMT);

  const apiParams = useMemo<ContractsFilters>(
    () => ({ zone, port, segment, status, emd, fromDate, toDate }),
    [zone, port, segment, status, emd, fromDate, toDate],
  );

  const dateValue: [Dayjs, Dayjs] | null =
    range && range[0] && range[1] ? [range[0], range[1]] : null;

  const qs = params.toString();

  return {
    zone,
    port,
    segment,
    status,
    emd,
    dateValue,
    params: apiParams,
    setValue,
    setDateRange,
    search: qs ? `?${qs}` : "",
    clearAll,
  };
};
