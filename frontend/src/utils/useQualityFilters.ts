import { useCallback, useMemo } from "react";
import dayjs, { type Dayjs } from "dayjs";
import { useMultiFilterParams } from "./useMultiFilterParams";
import { useUrlParam } from "./useUrlParam";
import { ytdRange } from "./datePresets";
import type { RefFilterField } from "../components/filters/refFilterFields";
import type { Currency } from "../types/finance";
import type { QualityFilterOptions, QualityParams, QualityTradeType } from "../types/marketing";

const FMT = "YYYY-MM-DD";

// Every Quality filter is multiselect, comma-joined in the URL (empty ⇒ "All").
// Quarter lives in the top bar; the rest are the Filters side-panel dropdowns.
export const QUALITY_MULTI_KEYS = [
  "quarters",
  "zone",
  "port",
  "origin",
  "segment",
  "grade",
  "vessel",
  "fiscalYears",
] as const;
export type QualityMultiKey = (typeof QUALITY_MULTI_KEYS)[number];
export type QualityDrawerKey = Exclude<QualityMultiKey, "quarters">;

type QualityDrawerField = RefFilterField<QualityDrawerKey, keyof QualityFilterOptions>;

// Display metadata for each Filters side-panel dropdown, shared by the drawer
// and the applied-filter chips so the two stay in lock-step. `optionsKey` ties
// a field to its list in the /marketing/quality/filters payload.
const QUALITY_DRAWER_FIELDS: QualityDrawerField[] = [
  { key: "zone", label: "Zone", optionsKey: "zones" },
  { key: "port", label: "Port", optionsKey: "ports" },
  { key: "origin", label: "Origin", optionsKey: "origins" },
  { key: "segment", label: "Segment", optionsKey: "segments" },
  { key: "grade", label: "Grade", optionsKey: "grades" },
  { key: "vessel", label: "Vessel", optionsKey: "vessels" },
  { key: "fiscalYears", label: "Fiscal Year", optionsKey: "fiscalYears" },
];

// Segment applies to the Sales tab only — the Purchase panel omits it.
const PURCHASE_DRAWER_FIELDS = QUALITY_DRAWER_FIELDS.filter((f) => f.key !== "segment");
export const qualityDrawerFields = (tradeType: QualityTradeType): QualityDrawerField[] =>
  tradeType === "sales" ? QUALITY_DRAWER_FIELDS : PURCHASE_DRAWER_FIELDS;

const DATE_KEYS = ["fromDate", "toDate"];
const DEFAULT_CURRENCY: Currency = "INR";

export interface QualityFiltersState {
  /** Cleaned query object for the API + a stable useApi query-key member. */
  params: QualityParams;
  /** Current values per filter (parsed from the comma-joined URL params). */
  multi: Record<QualityMultiKey, string[]>;
  /** Side-panel fields for the active tab. */
  drawerFields: QualityDrawerField[];
  /** Effective date range — the URL value, else fiscal YTD. */
  dateRange: [Dayjs, Dayjs];
  /** True when the user picked a range (not the YTD default). */
  isCustomRange: boolean;
  currency: Currency;
  setMulti: (key: QualityMultiKey, values: string[]) => void;
  /** Commit many keys atomically in one URL update. Used by the Filters drawer. */
  setMany: (entries: Partial<Record<QualityMultiKey, string[]>>) => void;
  setDateRange: (range: [Dayjs | null, Dayjs | null] | null) => void;
  setCurrency: (currency: Currency) => void;
  clearAll: () => void;
  /** How many side-panel filters are active on this tab — for the Filters badge. */
  drawerActiveCount: number;
}

// Central Quality filter state, backed by URL search params (via
// useMultiFilterParams) so a selection is shareable and survives
// reload/back-forward. Quarter and the Date Range are independent — both apply
// together. The range defaults to fiscal YTD and stays out of the URL until the
// user picks one; clearing the picker returns to YTD. Only the active tab's
// fields reach the API, so a Sales-only Segment pick never narrows the
// Purchase view.
export const useQualityFilters = (tradeType: QualityTradeType): QualityFiltersState => {
  const { searchParams, multi, setMulti, setMany, update } =
    useMultiFilterParams(QUALITY_MULTI_KEYS);

  const drawerFields = qualityDrawerFields(tradeType);

  const rawCurrency = searchParams.get("currency");
  const currency: Currency = rawCurrency === "USD" ? "USD" : DEFAULT_CURRENCY;

  // Stable so the default doesn't drift across re-renders.
  const defaultRange = useMemo(() => ytdRange(), []);

  // A half-set or unparsable range falls back to YTD, everywhere (picker,
  // chips and API) — never sent half-formed.
  const fromRaw = searchParams.get("fromDate");
  const toRaw = searchParams.get("toDate");
  const customRange = useMemo<[Dayjs, Dayjs] | null>(() => {
    if (!fromRaw || !toRaw) return null;
    const fd = dayjs(fromRaw);
    const td = dayjs(toRaw);
    return fd.isValid() && td.isValid() ? [fd, td] : null;
  }, [fromRaw, toRaw]);
  const dateRange = customRange ?? defaultRange;

  const params = useMemo<QualityParams>(() => {
    const out: Record<string, string> = {};
    for (const k of ["quarters", ...drawerFields.map((f) => f.key)] as QualityMultiKey[]) {
      if (multi[k].length) out[k] = multi[k].join(",");
    }
    out.fromDate = dateRange[0].format(FMT);
    out.toDate = dateRange[1].format(FMT);
    out.currency = currency;
    return out as QualityParams;
  }, [multi, drawerFields, dateRange, currency]);

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

  // The default currency is implied, so it stays out of the URL.
  const setCurrency = useCallback(
    (c: Currency) =>
      update((out) => {
        if (c === DEFAULT_CURRENCY) out.delete("currency");
        else out.set("currency", c);
      }),
    [update],
  );

  // Filters + date range (back to YTD); the tab and currency are view toggles,
  // so they stay.
  const clearAll = useCallback(
    () =>
      update((out) => {
        for (const k of [...QUALITY_MULTI_KEYS, ...DATE_KEYS]) out.delete(k);
      }),
    [update],
  );

  const drawerActiveCount = drawerFields.filter((f) => multi[f.key].length > 0).length;

  return {
    params,
    multi,
    drawerFields,
    dateRange,
    isCustomRange: customRange !== null,
    currency,
    setMulti,
    setMany,
    setDateRange,
    setCurrency,
    clearAll,
    drawerActiveCount,
  };
};

export const QUALITY_TAB_OPTIONS: { key: QualityTradeType; label: string }[] = [
  { key: "purchase", label: "Purchase" },
  { key: "sales", label: "Sales" },
];

const DEFAULT_TRADE_TYPE: QualityTradeType = "purchase";

const isTradeType = (v: string | undefined): v is QualityTradeType =>
  v === "purchase" || v === "sales";

// Active Purchase / Sales tab via the `?tab=` URL param, so the view is
// deep-linkable. The default tab writes no param (clean URL).
export const useQualityTradeType = (): [QualityTradeType, (next: QualityTradeType) => void] => {
  const [raw, setRaw] = useUrlParam("tab");
  const active: QualityTradeType = isTradeType(raw) ? raw : DEFAULT_TRADE_TYPE;
  const set = (next: QualityTradeType) => setRaw(next === DEFAULT_TRADE_TYPE ? undefined : next);
  return [active, set];
};
