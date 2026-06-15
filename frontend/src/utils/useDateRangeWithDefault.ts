import { useMemo } from "react";
import dayjs, { type Dayjs } from "dayjs";
import { useUrlDateRange } from "./useUrlParam";

const RANGE_FMT = "YYYY-MM-DD";
const PILL_FMT = "DD MMM YY";

export interface DateRangeWithDefault {
  /** Effective start — URL value if set, else (today − monthsBack). */
  start: Dayjs;
  /** Effective end — URL value if set, else today. */
  end: Dayjs;
  /** Tuple suitable for <DateRangeFilter value=…>. */
  value: [Dayjs, Dayjs];
  /** Effective raw "YYYY-MM-DD:YYYY-MM-DD" string, never undefined. */
  rawRange: string;
  /** Writes URL (or clears it on null → falls back to default). */
  setRange: (next: [Dayjs | null, Dayjs | null] | null) => void;
  /** True when the user has explicitly set a range via the URL. */
  isCustom: boolean;
}

// Shared default-date-range hook. Reads/writes the `dateRange` URL param via
// useUrlDateRange and applies a sensible default (today − N months → today)
// when no value is present. Used wherever a page has a "Date Range" filter so
// the picker comes pre-filled and the API gets a real range on first load.
export const useDateRangeWithDefault = (
  monthsBack = 1,
): DateRangeWithDefault => {
  const [tuple, setRange, raw] = useUrlDateRange();

  // Stable "today" so the default range doesn't drift across re-renders.
  const today = useMemo(() => dayjs(), []);
  const defaultStart = useMemo(
    () => today.subtract(monthsBack, "month"),
    [today, monthsBack],
  );

  const start = tuple?.[0] ?? defaultStart;
  const end = tuple?.[1] ?? today;
  const rawRange =
    raw ?? `${defaultStart.format(RANGE_FMT)}:${today.format(RANGE_FMT)}`;

  return {
    start,
    end,
    value: [start, end],
    rawRange,
    setRange,
    isCustom: Boolean(raw),
  };
};

export const formatDateRangePill = (start: Dayjs, end: Dayjs): string =>
  `${start.format(PILL_FMT)} – ${end.format(PILL_FMT)}`;
