import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import dayjs, { type Dayjs } from "dayjs";
import type { MarketShareParams, MarketShareFilterOptions } from "../types/marketing";

const FMT = "YYYY-MM-DD";

// Single-select filter keys. Only "Share" is single-select; it stores one id.
export const MS_SINGLE_KEYS = ["share"] as const;
export type MsSingleKey = (typeof MS_SINGLE_KEYS)[number];

// Multiselect filter keys, comma-joined in the URL. Year + Quarter live in the
// top bar; the rest are the multi-select Filters side-panel dropdowns.
export const MS_MULTI_KEYS = [
  "fiscalYears",
  "quarters",
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
export type MsMultiKey = (typeof MS_MULTI_KEYS)[number];

// Display metadata for each Filters side-panel dropdown, shared by the drawer
// and the applied-filter tags so the two stay in lock-step. Share is single-
// select; the rest are multi-select.
export interface DrawerFieldMeta {
  key: MsSingleKey | MsMultiKey;
  label: string;
  optionsKey: keyof MarketShareFilterOptions;
  multi: boolean;
}
export const MS_DRAWER_FIELDS: DrawerFieldMeta[] = [
  { key: "share", label: "Share", optionsKey: "shares", multi: false },
  { key: "zone", label: "Zone", optionsKey: "zones", multi: true },
  { key: "port", label: "Port", optionsKey: "ports", multi: true },
  { key: "origin", label: "Origin", optionsKey: "origins", multi: true },
  { key: "segment", label: "Segment", optionsKey: "segments", multi: true },
  { key: "addressable", label: "Addressable", optionsKey: "addressable", multi: true },
  { key: "industry", label: "Industry", optionsKey: "industries", multi: true },
  { key: "category", label: "Category", optionsKey: "categories", multi: true },
  { key: "shipperName", label: "Shipper Name", optionsKey: "shipperNames", multi: true },
  { key: "receiverName", label: "Receiver Name", optionsKey: "receiverNames", multi: true },
];

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
  setMulti: (key: MsMultiKey, values: string[]) => void;
  /** Commit many keys atomically in one URL update (arrays are comma-joined,
   *  empty arrays/blank strings clear the key). Used by the Filters drawer. */
  setMany: (entries: Record<string, string | string[] | undefined>) => void;
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

  const multi = useMemo(() => {
    const out = {} as Record<MsMultiKey, string[]>;
    for (const k of MS_MULTI_KEYS) out[k] = splitCsv(params.get(k));
    return out;
  }, [params]);

  const dateRange = useMemo<[Dayjs, Dayjs] | null>(() => {
    // Year/Quarter take precedence: the Date Range is treated as unset while
    // either is active (keeps the picker, tags and API params consistent).
    if (params.get("fiscalYears") || params.get("quarters")) return null;
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
    // Year/Quarter and Date Range are mutually exclusive. Year/Quarter (the
    // default "All" period) take precedence: when either is set, the Date Range
    // is ignored. The setters keep the two apart, but this also guards against a
    // hand-edited URL carrying both.
    if (out.fiscalYears || out.quarters) {
      delete out.fromDate;
      delete out.toDate;
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

  const setMulti = useCallback(
    (key: MsMultiKey, values: string[]) => {
      setParams(
        (prev) => {
          const out = new URLSearchParams(prev);
          if (values.length) out.set(key, values.join(","));
          else out.delete(key);
          // Setting Year/Quarter clears any Date Range (mutually exclusive).
          if (values.length && (key === "fiscalYears" || key === "quarters")) {
            out.delete("fromDate");
            out.delete("toDate");
          }
          return out;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  // Apply many keys atomically. A per-key loop of setSingle/setMulti would NOT
  // compose — React Router's functional updater closes over the render-time
  // params, so the last call clobbers the rest. One updater keeps every change.
  const setMany = useCallback(
    (entries: Record<string, string | string[] | undefined>) => {
      setParams(
        (prev) => {
          const out = new URLSearchParams(prev);
          for (const [k, v] of Object.entries(entries)) {
            const val = Array.isArray(v) ? (v.length ? v.join(",") : undefined) : v;
            if (!val) out.delete(k);
            else out.set(k, val);
          }
          return out;
        },
        { replace: true },
      );
    },
    [setParams],
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
            // Setting a Date Range clears Year/Quarter (mutually exclusive).
            out.delete("fiscalYears");
            out.delete("quarters");
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

  // Active side-panel filters (Share single + the multi-select dropdowns).
  const drawerActiveCount = MS_DRAWER_FIELDS.filter((f) =>
    f.multi ? multi[f.key as MsMultiKey].length > 0 : Boolean(single[f.key as MsSingleKey]),
  ).length;

  return {
    params: apiParams,
    single,
    multi,
    dateRange,
    setSingle,
    setMulti,
    setMany,
    setDateRange,
    clearKeys,
    clearAll,
    drawerActiveCount,
  };
};
