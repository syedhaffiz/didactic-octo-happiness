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
  /** Effective fromDate "YYYY-MM-DD" for the API. */
  fromDate: string;
  /** Effective toDate "YYYY-MM-DD" for the API. */
  toDate: string;
  /** Writes URL (or clears it on null → falls back to default). */
  setRange: (next: [Dayjs | null, Dayjs | null] | null) => void;
  /** True when the user has explicitly set a range via the URL. */
  isCustom: boolean;
}

// Shared default-date-range hook. Reads/writes the `fromDate` + `toDate` URL
// params via useUrlDateRange and applies a default of (today − N months →
// today) when neither is present. Consumers get `fromDate` + `toDate` for the
// API call and a `[start, end]` tuple for the picker.
export const useDateRangeWithDefault = (
  monthsBack = 1,
): DateRangeWithDefault => {
  const [tuple, setRange] = useUrlDateRange();

  // Stable "today" so the default range doesn't drift across re-renders.
  const today = useMemo(() => dayjs(), []);
  const defaultStart = useMemo(
    () => today.subtract(monthsBack, "month"),
    [today, monthsBack],
  );

  const start = tuple?.[0] ?? defaultStart;
  const end = tuple?.[1] ?? today;

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
