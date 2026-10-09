import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import dayjs, { type Dayjs } from "dayjs";
import { useUrlParam } from "./useUrlParam";
import type { IiaBillingFilterOptions, IiaBillingParams, IiaPortType } from "../types/marketing";

const FMT = "YYYY-MM-DD";

// Every IIA Billing filter is multiselect, comma-joined in the URL. Fiscal Year
// + Quarter live in the top bar; the rest are the Filters side-panel dropdowns.
export const IIA_MULTI_KEYS = [
  "fiscalYears",
  "quarters",
  "zone",
  "port",
  "segment",
  "customer",
  "vendor",
] as const;
export type IiaMultiKey = (typeof IIA_MULTI_KEYS)[number];

// Display metadata for each Filters side-panel dropdown, shared by the drawer
// and the applied-filter chips so the two stay in lock-step.
export interface IiaDrawerField {
  key: IiaMultiKey;
  label: string;
  optionsKey: keyof IiaBillingFilterOptions;
}
export const IIA_DRAWER_FIELDS: IiaDrawerField[] = [
  { key: "zone", label: "Zone", optionsKey: "zones" },
  { key: "port", label: "Port", optionsKey: "ports" },
  { key: "segment", label: "Segment", optionsKey: "segments" },
  { key: "customer", label: "Customer", optionsKey: "customers" },
  { key: "vendor", label: "Vendor", optionsKey: "vendors" },
];

const PERIOD_KEYS = ["fiscalYears", "quarters"];
const DATE_KEYS = ["fromDate", "toDate"];
const ALL_KEYS: string[] = [...IIA_MULTI_KEYS, ...DATE_KEYS];

export interface IiaBillingFiltersState {
  /** Cleaned query object for the API + as a stable useApi query-key member. */
  params: IiaBillingParams;
  /** Current values per filter (parsed from the comma-joined URL params). */
  multi: Record<IiaMultiKey, string[]>;
  /** Current date range, or null when unset. */
  dateRange: [Dayjs, Dayjs] | null;
  setMulti: (key: IiaMultiKey, values: string[]) => void;
  /** Commit many keys atomically in one URL update. Used by the Filters drawer. */
  setMany: (entries: Partial<Record<IiaMultiKey, string[]>>) => void;
  setDateRange: (range: [Dayjs | null, Dayjs | null] | null) => void;
  clearAll: () => void;
  /** How many side-panel filters are active — for the Filters badge. */
  drawerActiveCount: number;
}

const splitCsv = (v: string | null): string[] => (v ? v.split(",").filter(Boolean) : []);

// Central IIA Billing filter state, backed by URL search params so a selection
// is shareable and survives reload/back-forward. Year/Quarter and the Date
// Range are mutually exclusive — setting one side clears the other. The active
// tab (`?tab=`) is owned separately and is left alone by `clearAll`.
export const useIiaBillingFilters = (): IiaBillingFiltersState => {
  const [params, setParams] = useSearchParams();

  const multi = useMemo(() => {
    const out = {} as Record<IiaMultiKey, string[]>;
    for (const k of IIA_MULTI_KEYS) out[k] = splitCsv(params.get(k));
    return out;
  }, [params]);

  const periodActive = PERIOD_KEYS.some((k) => params.get(k));

  const dateRange = useMemo<[Dayjs, Dayjs] | null>(() => {
    if (periodActive) return null;
    const f = params.get("fromDate");
    const t = params.get("toDate");
    if (!f || !t) return null;
    const fd = dayjs(f);
    const td = dayjs(t);
    return fd.isValid() && td.isValid() ? [fd, td] : null;
  }, [params, periodActive]);

  const apiParams = useMemo<IiaBillingParams>(() => {
    const out: Record<string, string> = {};
    for (const k of ALL_KEYS) {
      const v = params.get(k);
      if (v) out[k] = v;
    }
    // Guards a hand-edited URL carrying both: Year/Quarter win.
    if (periodActive) for (const k of DATE_KEYS) delete out[k];
    return out as IiaBillingParams;
  }, [params, periodActive]);

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
    (key: IiaMultiKey, values: string[]) =>
      update((out) => {
        if (values.length) out.set(key, values.join(","));
        else out.delete(key);
        if (values.length && PERIOD_KEYS.includes(key)) {
          for (const k of DATE_KEYS) out.delete(k);
        }
      }),
    [update],
  );

  // One updater for all keys — separate setMulti calls would each close over
  // the render-time params and clobber one another.
  const setMany = useCallback(
    (entries: Partial<Record<IiaMultiKey, string[]>>) =>
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
        for (const k of PERIOD_KEYS) out.delete(k);
      }),
    [update],
  );

  const clearAll = useCallback(
    () =>
      update((out) => {
        for (const k of ALL_KEYS) out.delete(k);
      }),
    [update],
  );

  const drawerActiveCount = IIA_DRAWER_FIELDS.filter((f) => multi[f.key].length > 0).length;

  return {
    params: apiParams,
    multi,
    dateRange,
    setMulti,
    setMany,
    setDateRange,
    clearAll,
    drawerActiveCount,
  };
};

const DEFAULT_PORT_TYPE: IiaPortType = "load";

const isPortType = (v: string | undefined): v is IiaPortType =>
  v === "load" || v === "discharge";

// Active Load / Discharge Port tab via the `?tab=` URL param, so the view is
// deep-linkable. The default tab writes no param (clean URL).
export const useIiaPortType = (): [IiaPortType, (next: IiaPortType) => void] => {
  const [raw, setRaw] = useUrlParam("tab");
  const active: IiaPortType = isPortType(raw) ? raw : DEFAULT_PORT_TYPE;
  const set = (next: IiaPortType) => setRaw(next === DEFAULT_PORT_TYPE ? undefined : next);
  return [active, set];
};
