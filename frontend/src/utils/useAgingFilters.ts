import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import dayjs, { type Dayjs } from "dayjs";
import { splitCsv } from "./csv";
import type { AgingFilterOptions, AgingFilters, AgingMeasure } from "../types/finance";

const FMT = "YYYY-MM-DD";

// Every Filters side-panel dropdown is a multi-select, comma-joined in the URL
// (empty ⇒ "All").
export const AGING_MULTI_KEYS = ["zone", "port", "origin", "segment", "mine"] as const;
export type AgingMultiKey = (typeof AGING_MULTI_KEYS)[number];

// Display metadata for each Filters side-panel dropdown, shared by the drawer
// and the applied-filter tags so the two stay in lock-step. `optionsKey` ties a
// field to its list in the /finance/aging/filters payload.
export interface AgingDrawerField {
  key: AgingMultiKey;
  label: string;
  optionsKey: keyof AgingFilterOptions;
}
export const AGING_DRAWER_FIELDS: AgingDrawerField[] = [
  { key: "zone", label: "Zone", optionsKey: "zones" },
  { key: "port", label: "Port", optionsKey: "ports" },
  { key: "origin", label: "Origin", optionsKey: "origins" },
  { key: "segment", label: "Segment", optionsKey: "segments" },
  { key: "mine", label: "Mine", optionsKey: "mines" },
];

export const DEFAULT_AGING_MEASURE: AgingMeasure = "volume";

// Guards the `measure` URL param — anything unrecognised falls back to the
// default rather than reaching the API.
const isAgingMeasure = (v: string | null | undefined): v is AgingMeasure =>
  v === "volume" || v === "value";

const DATE_KEYS = ["fromDate", "toDate"];
// `measure` is a view toggle, not a filter — `clearAll` leaves it alone.
const FILTER_KEYS: string[] = [...AGING_MULTI_KEYS, ...DATE_KEYS];

export interface AgingFiltersState {
  /** Cleaned query object for the API + a stable useApi query-key member. */
  params: AgingFilters;
  /** Current values per side-panel filter (parsed from the comma-joined URL). */
  multi: Record<AgingMultiKey, string[]>;
  /** Current date range, or null when unset (the full reporting period). */
  dateRange: [Dayjs, Dayjs] | null;
  measure: AgingMeasure;
  setMulti: (key: AgingMultiKey, values: string[]) => void;
  /** Commit many keys atomically in one URL update. Used by the Filters drawer. */
  setMany: (entries: Partial<Record<AgingMultiKey, string[]>>) => void;
  setDateRange: (range: [Dayjs | null, Dayjs | null] | null) => void;
  setMeasure: (measure: AgingMeasure) => void;
  clearAll: () => void;
  /** How many side-panel filters are active — for the Filters badge. */
  drawerActiveCount: number;
}

// Central Aging filter state, backed by URL search params so a selection is
// shareable and survives reload/back-forward. Mirrors useIiaBillingFilters /
// useMarketShareFilters.
export const useAgingFilters = (): AgingFiltersState => {
  const [params, setParams] = useSearchParams();

  const multi = useMemo(() => {
    const out = {} as Record<AgingMultiKey, string[]>;
    for (const k of AGING_MULTI_KEYS) out[k] = splitCsv(params.get(k));
    return out;
  }, [params]);

  const rawMeasure = params.get("measure");
  const measure: AgingMeasure = isAgingMeasure(rawMeasure) ? rawMeasure : DEFAULT_AGING_MEASURE;

  // A half-set or unparsable range is treated as unset, everywhere (picker,
  // tags and API) — never sent half-formed.
  const dateRange = useMemo<[Dayjs, Dayjs] | null>(() => {
    const f = params.get("fromDate");
    const t = params.get("toDate");
    if (!f || !t) return null;
    const fd = dayjs(f);
    const td = dayjs(t);
    return fd.isValid() && td.isValid() ? [fd, td] : null;
  }, [params]);

  const apiParams = useMemo<AgingFilters>(() => {
    const out: AgingFilters = { measure };
    for (const k of AGING_MULTI_KEYS) {
      if (multi[k].length) out[k] = multi[k].join(",");
    }
    if (dateRange) {
      out.fromDate = dateRange[0].format(FMT);
      out.toDate = dateRange[1].format(FMT);
    }
    return out;
  }, [multi, dateRange, measure]);

  const update = useCallback(
    (mutate: (out: URLSearchParams) => void) =>
      setParams(
        (prev) => {
          const out = new URLSearchParams(prev);
          mutate(out);
          return out;
        },
        { replace: true },
      ),
    [setParams],
  );

  const setMulti = useCallback(
    (key: AgingMultiKey, values: string[]) =>
      update((out) => {
        if (values.length) out.set(key, values.join(","));
        else out.delete(key);
      }),
    [update],
  );

  // One updater for all keys — separate setMulti calls would each close over
  // the render-time params and clobber one another.
  const setMany = useCallback(
    (entries: Partial<Record<AgingMultiKey, string[]>>) =>
      update((out) => {
        for (const [k, v] of Object.entries(entries)) {
          if (v?.length) out.set(k, v.join(","));
          else out.delete(k);
        }
      }),
    [update],
  );

  const setDateRange = useCallback(
    (range: [Dayjs | null, Dayjs | null] | null) =>
      update((out) => {
        if (!range || !range[0] || !range[1]) {
          for (const k of DATE_KEYS) out.delete(k);
          return;
        }
        out.set("fromDate", range[0].format(FMT));
        out.set("toDate", range[1].format(FMT));
      }),
    [update],
  );

  // The default measure is implied, so it stays out of the URL.
  const setMeasure = useCallback(
    (m: AgingMeasure) =>
      update((out) => {
        if (m === DEFAULT_AGING_MEASURE) out.delete("measure");
        else out.set("measure", m);
      }),
    [update],
  );

  const clearAll = useCallback(
    () =>
      update((out) => {
        for (const k of FILTER_KEYS) out.delete(k);
      }),
    [update],
  );

  const drawerActiveCount = AGING_DRAWER_FIELDS.filter((f) => multi[f.key].length > 0).length;

  return {
    params: apiParams,
    multi,
    dateRange,
    measure,
    setMulti,
    setMany,
    setDateRange,
    setMeasure,
    clearAll,
    drawerActiveCount,
  };
};
