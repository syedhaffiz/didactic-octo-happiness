import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import dayjs, { type Dayjs } from "dayjs";
import type { MarketShareParams, MarketShareFilterOptions } from "../types/marketing";

const FMT = "YYYY-MM-DD";

// Single-select filter keys — live in the Filters side-panel. Each stores one id.
export const MS_SINGLE_KEYS = [
  "share",
  "zone",
  "port",
  "origin",
  "segment",
  "addressable",
  "industry",
  "category",
  "shipperName",
  "receiverName",
] as const;
export type MsSingleKey = (typeof MS_SINGLE_KEYS)[number];

// Display label + backing option list for each side-panel single-select filter.
// Shared by the Filters drawer and the applied-filter tags so the two stay in
// lock-step.
export const MS_SINGLE_FIELDS: {
  key: MsSingleKey;
  label: string;
  optionsKey: keyof MarketShareFilterOptions;
}[] = [
  { key: "share", label: "Share", optionsKey: "shares" },
  { key: "zone", label: "Zone", optionsKey: "zones" },
  { key: "port", label: "Port", optionsKey: "ports" },
  { key: "origin", label: "Origin", optionsKey: "origins" },
  { key: "segment", label: "Segment", optionsKey: "segments" },
  { key: "addressable", label: "Addressable", optionsKey: "addressable" },
  { key: "industry", label: "Industry", optionsKey: "industries" },
  { key: "category", label: "Category", optionsKey: "categories" },
  { key: "shipperName", label: "Shipper Name", optionsKey: "shipperNames" },
  { key: "receiverName", label: "Receiver Name", optionsKey: "receiverNames" },
];

// Multiselect filter keys — Year + Quarter in the top bar, comma-joined in URL.
export const MS_MULTI_KEYS = ["fiscalYears", "quarters"] as const;
export type MsMultiKey = (typeof MS_MULTI_KEYS)[number];

const DATE_KEYS = ["fromDate", "toDate"] as const;
const ALL_KEYS: string[] = [...MS_MULTI_KEYS, ...MS_SINGLE_KEYS, ...DATE_KEYS];

export interface MarketShareFiltersState {
  /** Cleaned query object for the API + as a stable useApi query-key member. */
  params: MarketShareParams;
  /** Current single-select values keyed by filter. */
  single: Record<MsSingleKey, string | undefined>;
  /** Current multiselect values (parsed from the comma-joined URL params). */
  multi: Record<MsMultiKey, string[]>;
  /** Current date range, or null when unset. */
  dateRange: [Dayjs, Dayjs] | null;
  setSingle: (key: MsSingleKey, value: string | undefined) => void;
  /** Commit every side-panel single-select value in one URL update. */
  setSingleBatch: (next: Record<MsSingleKey, string | undefined>) => void;
  setMulti: (key: MsMultiKey, values: string[]) => void;
  setDateRange: (range: [Dayjs | null, Dayjs | null] | null) => void;
  clearKeys: (keys: string[]) => void;
  clearAll: () => void;
  /** How many side-panel (single) filters are active — for the Filters badge. */
  drawerActiveCount: number;
}

const splitCsv = (v: string | null): string[] => (v ? v.split(",").filter(Boolean) : []);

// Central Market Share filter state, backed entirely by URL search params so
// every selection is shareable and survives reload/back-forward. Multiselect
// values are comma-joined; the date range uses the shared fromDate/toDate keys.
export const useMarketShareFilters = (): MarketShareFiltersState => {
  const [params, setParams] = useSearchParams();

  const single = useMemo(() => {
    const out = {} as Record<MsSingleKey, string | undefined>;
    for (const k of MS_SINGLE_KEYS) out[k] = params.get(k) ?? undefined;
    return out;
  }, [params]);

  const multi = useMemo<Record<MsMultiKey, string[]>>(
    () => ({
      fiscalYears: splitCsv(params.get("fiscalYears")),
      quarters: splitCsv(params.get("quarters")),
    }),
    [params],
  );

  const dateRange = useMemo<[Dayjs, Dayjs] | null>(() => {
    const f = params.get("fromDate");
    const t = params.get("toDate");
    if (!f || !t) return null;
    const fd = dayjs(f);
    const td = dayjs(t);
    return fd.isValid() && td.isValid() ? [fd, td] : null;
  }, [params]);

  const apiParams = useMemo<MarketShareParams>(() => {
    const out: Record<string, string> = {};
    for (const k of ALL_KEYS) {
      const v = params.get(k);
      if (v) out[k] = v;
    }
    return out as MarketShareParams;
  }, [params]);

  const setKey = useCallback(
    (key: string, value: string | undefined) => {
      setParams(
        (prev) => {
          const out = new URLSearchParams(prev);
          if (!value) out.delete(key);
          else out.set(key, value);
          return out;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  const setSingle = useCallback(
    (key: MsSingleKey, value: string | undefined) => setKey(key, value),
    [setKey],
  );

  // Apply all single-select values atomically. A per-key loop of setSingle
  // calls would NOT compose — React Router's functional updater closes over the
  // render-time params, so the last call clobbers the rest. One updater keeps
  // every change.
  const setSingleBatch = useCallback(
    (next: Record<MsSingleKey, string | undefined>) => {
      setParams(
        (prev) => {
          const out = new URLSearchParams(prev);
          for (const k of MS_SINGLE_KEYS) {
            const v = next[k];
            if (!v) out.delete(k);
            else out.set(k, v);
          }
          return out;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  const setMulti = useCallback(
    (key: MsMultiKey, values: string[]) => setKey(key, values.length ? values.join(",") : undefined),
    [setKey],
  );

  const setDateRange = useCallback(
    (range: [Dayjs | null, Dayjs | null] | null) => {
      setParams(
        (prev) => {
          const out = new URLSearchParams(prev);
          if (!range || !range[0] || !range[1]) {
            out.delete("fromDate");
            out.delete("toDate");
          } else {
            out.set("fromDate", range[0].format(FMT));
            out.set("toDate", range[1].format(FMT));
          }
          return out;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  const clearKeys = useCallback(
    (keys: string[]) => {
      setParams(
        (prev) => {
          const out = new URLSearchParams(prev);
          for (const k of keys) out.delete(k);
          return out;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  const clearAll = useCallback(() => clearKeys(ALL_KEYS), [clearKeys]);

  const drawerActiveCount = MS_SINGLE_KEYS.filter((k) => single[k]).length;

  return {
    params: apiParams,
    single,
    multi,
    dateRange,
    setSingle,
    setSingleBatch,
    setMulti,
    setDateRange,
    clearKeys,
    clearAll,
    drawerActiveCount,
  };
};
