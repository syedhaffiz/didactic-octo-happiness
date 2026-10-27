import { useCallback, useMemo } from "react";
import dayjs, { type Dayjs } from "dayjs";
import { useMultiFilterParams } from "./useMultiFilterParams";
import { useUrlParam } from "./useUrlParam";
import { ytdRange } from "./datePresets";
import type { RefFilterField } from "../components/filters/refFilterFields";
import type { IiaBillingFilterOptions, IiaBillingParams, IiaPortType } from "../types/marketing";

const FMT = "YYYY-MM-DD";

// Every IIA Billing filter is multiselect, comma-joined in the URL (empty ⇒
// "All"). Fiscal Year + Quarter live in the top bar; the rest are the Filters
// side-panel dropdowns.
export const IIA_MULTI_KEYS = [
  "fiscalYears",
  "quarters",
  "zone",
  "port",
  "origin",
  "grade",
  "segment",
  "vendor",
  "tradeTerms",
  "vessel",
] as const;
export type IiaMultiKey = (typeof IIA_MULTI_KEYS)[number];
type IiaDrawerKey = Exclude<IiaMultiKey, "fiscalYears" | "quarters">;

// Display metadata for each Filters side-panel dropdown, shared by the drawer
// and the applied-filter chips so the two stay in lock-step. `optionsKey` ties
// a field to its list in the /marketing/iia-billing/filters payload.
export const IIA_DRAWER_FIELDS: RefFilterField<IiaDrawerKey, keyof IiaBillingFilterOptions>[] = [
  { key: "zone", label: "Zone", optionsKey: "zones" },
  { key: "port", label: "Port", optionsKey: "ports" },
  { key: "origin", label: "Origin", optionsKey: "origins" },
  { key: "grade", label: "Grade", optionsKey: "grades" },
  { key: "segment", label: "Segment", optionsKey: "segments" },
  { key: "vendor", label: "Vendor Name", optionsKey: "vendors" },
  { key: "tradeTerms", label: "Trade Terms", optionsKey: "tradeTerms" },
  { key: "vessel", label: "Vessel", optionsKey: "vessels" },
];

const PERIOD_KEYS: IiaMultiKey[] = ["fiscalYears", "quarters"];
const DATE_KEYS = ["fromDate", "toDate"];

export interface IiaBillingFiltersState {
  /** Cleaned query object for the API + as a stable useApi query-key member. */
  params: IiaBillingParams;
  /** Current values per filter (parsed from the comma-joined URL params). */
  multi: Record<IiaMultiKey, string[]>;
  /** Effective date range — the URL value, else fiscal YTD. Null while a
   *  Fiscal Year / Quarter is selected (the two are mutually exclusive). */
  dateRange: [Dayjs, Dayjs] | null;
  /** True when the user picked a range (not the YTD default). */
  isCustomRange: boolean;
  /** True when a Fiscal Year or Quarter is selected. */
  periodActive: boolean;
  setMulti: (key: IiaMultiKey, values: string[]) => void;
  /** Commit many keys atomically in one URL update. Used by the Filters drawer. */
  setMany: (entries: Partial<Record<IiaMultiKey, string[]>>) => void;
  setDateRange: (range: [Dayjs | null, Dayjs | null] | null) => void;
  clearAll: () => void;
  /** How many side-panel filters are active — for the Filters badge. */
  drawerActiveCount: number;
}

// Central IIA Billing filter state, backed by URL search params (via
// useMultiFilterParams) so a selection is shareable and survives
// reload/back-forward. The Date Range defaults to fiscal YTD and stays out of
// the URL until the user picks one. Fiscal Year / Quarter and the Date Range
// are mutually exclusive: picking a period replaces the range, and clearing it
// returns to YTD. The active tab (`?tab=`) is a view toggle, left alone by
// `clearAll`.
export const useIiaBillingFilters = (): IiaBillingFiltersState => {
  const { searchParams, multi, csv, setMany, update } = useMultiFilterParams(IIA_MULTI_KEYS);

  const periodActive = PERIOD_KEYS.some((k) => multi[k].length > 0);

  // Stable so the default doesn't drift across re-renders.
  const defaultRange = useMemo(() => ytdRange(), []);

  // A half-set or unparsable range falls back to YTD everywhere (picker, chips
  // and API) — never sent half-formed.
  const fromRaw = searchParams.get("fromDate");
  const toRaw = searchParams.get("toDate");
  const customRange = useMemo<[Dayjs, Dayjs] | null>(() => {
    if (!fromRaw || !toRaw) return null;
    const fd = dayjs(fromRaw);
    const td = dayjs(toRaw);
    return fd.isValid() && td.isValid() ? [fd, td] : null;
  }, [fromRaw, toRaw]);

  // Year/Quarter win over any range — also guards a hand-edited URL carrying both.
  const dateRange = periodActive ? null : customRange ?? defaultRange;

  const params = useMemo<IiaBillingParams>(() => {
    const out: IiaBillingParams = { ...csv };
    if (dateRange) {
      out.fromDate = dateRange[0].format(FMT);
      out.toDate = dateRange[1].format(FMT);
    }
    return out;
  }, [csv, dateRange]);

  const setMulti = useCallback(
    (key: IiaMultiKey, values: string[]) =>
      update((out) => {
        if (values.length) out.set(key, values.join(","));
        else out.delete(key);
        // Picking a period drops any custom range (mutually exclusive).
        if (values.length && PERIOD_KEYS.includes(key)) {
          for (const k of DATE_KEYS) out.delete(k);
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

  // Filters + date range (back to YTD); the tab stays.
  const clearAll = useCallback(
    () =>
      update((out) => {
        for (const k of [...IIA_MULTI_KEYS, ...DATE_KEYS]) out.delete(k);
      }),
    [update],
  );

  const drawerActiveCount = IIA_DRAWER_FIELDS.filter((f) => multi[f.key].length > 0).length;

  return {
    params,
    multi,
    dateRange,
    isCustomRange: !periodActive && customRange !== null,
    periodActive,
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
