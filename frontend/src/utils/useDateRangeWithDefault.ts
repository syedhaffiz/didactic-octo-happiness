import { useCallback, useMemo } from "react";
import dayjs, { type Dayjs } from "dayjs";
import { useUrlDateRange } from "./useUrlParam";

const RANGE_FMT = "YYYY-MM-DD";
const PILL_FMT = "DD MMM YY";

// --- Persisted range ("carry down" support) --------------------------------
// A range explicitly picked on one persisting screen becomes the default on the
// next one that has no range of its own — e.g. the Finance Overview selection
// carries down to its child routes. Scoped to opt-in (`persist`) callers so it
// never leaks across unrelated modules. sessionStorage so it survives reloads
// within the tab but resets for a fresh session.
const RANGE_STORE_KEY = "finance:dateRange";

const readStoredRange = (): [Dayjs, Dayjs] | null => {
  try {
    const raw = sessionStorage.getItem(RANGE_STORE_KEY);
    if (!raw) return null;
    const { fromDate, toDate } = JSON.parse(raw) as { fromDate?: string; toDate?: string };
    const f = dayjs(fromDate);
    const t = dayjs(toDate);
    return f.isValid() && t.isValid() ? [f, t] : null;
  } catch {
    return null;
  }
};

const writeStoredRange = (range: [Dayjs, Dayjs] | null) => {
  try {
    if (!range) sessionStorage.removeItem(RANGE_STORE_KEY);
    else
      sessionStorage.setItem(
        RANGE_STORE_KEY,
        JSON.stringify({ fromDate: range[0].format(RANGE_FMT), toDate: range[1].format(RANGE_FMT) }),
      );
  } catch {
    /* storage unavailable (private mode / SSR) — carry-down simply no-ops */
  }
};

export interface DateRangeWithDefault {
  /** Effective start — URL value if set, else (today − monthsBack). */
  start: Dayjs;
  /** Effective end — URL value if set, else today. */
  end: Dayjs;
  /** Tuple suitable for <DateRangeFilter value=…>. */
  value: [Dayjs, Dayjs];
  /** Effective fromDate "YYYY-MM-DD" for the API. */
  fromDate: string;
  /** Effective toDate "YYYY-MM-DD" for the API. */
  toDate: string;
  /** Writes URL (or clears it on null → falls back to default). */
  setRange: (next: [Dayjs | null, Dayjs | null] | null) => void;
  /** True when the user has explicitly set a range via the URL. */
  isCustom: boolean;
}

interface Options {
  /** When set, an explicit selection is remembered and reused as the default on
   *  the next persisting screen that has no range of its own (carry-down). */
  persist?: boolean;
}

// Shared default-date-range hook. Reads/writes the `fromDate` + `toDate` URL
// params via useUrlDateRange and applies a default of (today − N months →
// today) when neither is present. Consumers get `fromDate` + `toDate` for the
// API call and a `[start, end]` tuple for the picker. With `persist`, the
// default instead falls back to the last range picked on a persisting screen.
export const useDateRangeWithDefault = (
  monthsBack = 1,
  { persist = false }: Options = {},
): DateRangeWithDefault => {
  const [tuple, setUrlRange] = useUrlDateRange();

  // Stable "today" so the default range doesn't drift across re-renders.
  const today = useMemo(() => dayjs(), []);
  // Read fresh each render (not memoised) so clearing the store reverts to the
  // today-based default rather than a stale value.
  const stored = persist ? readStoredRange() : null;

  const start = tuple?.[0] ?? stored?.[0] ?? today.subtract(monthsBack, "month");
  const end = tuple?.[1] ?? stored?.[1] ?? today;

  const setRange = useCallback(
    (next: [Dayjs | null, Dayjs | null] | null) => {
      setUrlRange(next);
      if (persist) {
        writeStoredRange(next && next[0] && next[1] ? [next[0], next[1]] : null);
      }
    },
    [setUrlRange, persist],
  );

  return {
    start,
    end,
    value: [start, end],
    fromDate: start.format(RANGE_FMT),
    toDate: end.format(RANGE_FMT),
    setRange,
    isCustom: tuple !== null,
  };
};

export const formatDateRangePill = (start: Dayjs, end: Dayjs): string =>
  `${start.format(PILL_FMT)} – ${end.format(PILL_FMT)}`;

export interface MonthRangeWithDefault {
  /** Tuple suitable for a month-mode <RangePicker value=…>. */
  value: [Dayjs, Dayjs];
  /** First day of the from-month, "YYYY-MM-DD", for the API. */
  fromDate: string;
  /** Last day of the to-month, "YYYY-MM-DD", for the API. */
  toDate: string;
  /** Writes URL (or clears it on null → falls back to default). */
  setRange: (next: [Dayjs | null, Dayjs | null] | null) => void;
}

// Month range backed by the same `fromDate` / `toDate` URL params as the day
// picker. Defaults to the last `months` calendar months (inclusive of the
// current month). The month picker emits month-start dates, so we normalise to
// whole-month bounds — first day of the first month through the last day of the
// last month — which is what flows to the API.
export const useMonthRangeWithDefault = (months = 6): MonthRangeWithDefault => {
  const [tuple, setUrlRange] = useUrlDateRange();

  const today = useMemo(() => dayjs(), []);
  const defaultStart = useMemo(
    () => today.subtract(months - 1, "month").startOf("month"),
    [today, months],
  );
  const defaultEnd = useMemo(() => today.endOf("month"), [today]);

  const start = (tuple?.[0] ?? defaultStart).startOf("month");
  const end = (tuple?.[1] ?? defaultEnd).endOf("month");

  const setRange = useCallback(
    (next: [Dayjs | null, Dayjs | null] | null) => {
      if (!next || !next[0] || !next[1]) {
        setUrlRange(null);
        return;
      }
      setUrlRange([next[0].startOf("month"), next[1].endOf("month")]);
    },
    [setUrlRange],
  );

  return {
    value: [start, end],
    fromDate: start.format(RANGE_FMT),
    toDate: end.format(RANGE_FMT),
    setRange,
  };
};
