import { useCallback, useMemo } from "react";
import dayjs, { type Dayjs } from "dayjs";
import { useMultiFilterParams } from "./useMultiFilterParams";
import { DEFAULT_TIME_FRAME, isTimeFrame } from "../components/filters/timeFrame";
import type { RefFilterField } from "../components/filters/refFilterFields";
import type {
  InventoryDaysFilterOptions,
  InventoryDaysFilters,
  TimeFrame,
} from "../types/finance";

const MONTH_FMT = "YYYY-MM";

// Every Filters side-panel dropdown is a multi-select, comma-joined in the URL
// (empty ⇒ "All"). Time Frame + Month stay in the header row.
export const INVENTORY_DAYS_MULTI_KEYS = ["zone", "port", "origin", "segment"] as const;
export type InventoryDaysMultiKey = (typeof INVENTORY_DAYS_MULTI_KEYS)[number];

// Display metadata for each Filters side-panel dropdown, shared by the drawer
// and the applied-filter chips. `optionsKey` ties a field to its list in the
// /finance/inventory-days/filters payload.
export const INVENTORY_DAYS_DRAWER_FIELDS: RefFilterField<
  InventoryDaysMultiKey,
  keyof InventoryDaysFilterOptions
>[] = [
  { key: "zone", label: "Zone", optionsKey: "zones" },
  { key: "port", label: "Port", optionsKey: "ports" },
  { key: "origin", label: "Origin", optionsKey: "origins" },
  { key: "segment", label: "Segment", optionsKey: "segments" },
];

// Default Month: the current month once we're past the 7th, otherwise the
// previous month (early in a month the current month's book isn't settled yet).
const defaultMonth = (): Dayjs => {
  const today = dayjs();
  return today.date() > 7 ? today.startOf("month") : today.subtract(1, "month").startOf("month");
};

// Parse a "YYYY-MM" URL value; anything else falls back to the default month.
// The shape is checked before parsing, then a day appended so dayjs reads it as
// a full ISO date (no customParseFormat plugin is registered).
const parseMonth = (raw: string | null): Dayjs => {
  if (raw && /^\d{4}-\d{2}$/.test(raw)) {
    const parsed = dayjs(`${raw}-01`);
    if (parsed.isValid()) return parsed.startOf("month");
  }
  return defaultMonth();
};

export interface InventoryDaysFiltersState {
  /** Cleaned query object for the API + a stable useApi query-key member. */
  params: InventoryDaysFilters;
  /** Current values per side-panel filter (parsed from the comma-joined URL). */
  multi: Record<InventoryDaysMultiKey, string[]>;
  timeFrame: TimeFrame;
  /** Selected month (first day); always set — defaults when absent / invalid. */
  month: Dayjs;
  setMulti: (key: InventoryDaysMultiKey, values: string[]) => void;
  /** Commit many keys atomically in one URL update. Used by the Filters drawer. */
  setMany: (entries: Partial<Record<InventoryDaysMultiKey, string[]>>) => void;
  setTimeFrame: (v: TimeFrame) => void;
  setMonth: (v: Dayjs | null) => void;
  /** Clears the side-panel filters; Time Frame + Month keep their values. */
  clearAll: () => void;
  /** How many side-panel filters are active — for the Filters badge. */
  drawerActiveCount: number;
}

// Central Inventory Days filter state, backed by URL search params (via
// useMultiFilterParams). Adds the Time Frame + Month snapshot selectors, both
// of which fall back to the design defaults when absent / invalid in the URL.
export const useInventoryDaysFilters = (): InventoryDaysFiltersState => {
  const { searchParams, multi, csv, setMulti, setMany, clearMulti, update, activeCount } =
    useMultiFilterParams(INVENTORY_DAYS_MULTI_KEYS);

  const rawTimeFrame = searchParams.get("timeFrame") ?? undefined;
  const timeFrame: TimeFrame = isTimeFrame(rawTimeFrame) ? rawTimeFrame : DEFAULT_TIME_FRAME;

  const rawMonth = searchParams.get("month");
  const month = useMemo(() => parseMonth(rawMonth), [rawMonth]);
  const monthKey = month.format(MONTH_FMT);

  const params = useMemo<InventoryDaysFilters>(
    () => ({ ...csv, timeFrame, month: monthKey }),
    [csv, timeFrame, monthKey],
  );

  // The default time frame is implied, so it stays out of the URL.
  const setTimeFrame = useCallback(
    (v: TimeFrame) =>
      update((out) => {
        if (v === DEFAULT_TIME_FRAME) out.delete("timeFrame");
        else out.set("timeFrame", v);
      }),
    [update],
  );

  const setMonth = useCallback(
    (d: Dayjs | null) =>
      update((out) => {
        if (d && d.isValid()) out.set("month", d.format(MONTH_FMT));
        else out.delete("month");
      }),
    [update],
  );

  return {
    params,
    multi,
    timeFrame,
    month,
    setMulti,
    setMany,
    setTimeFrame,
    setMonth,
    clearAll: clearMulti,
    drawerActiveCount: activeCount,
  };
};
