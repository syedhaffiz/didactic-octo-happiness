import dayjs, { type Dayjs } from "dayjs";

// Fiscal year starts 01-Apr. For any date, the current fiscal year begins on
// 01-Apr of this calendar year when we're in Apr–Dec, otherwise 01-Apr of the
// previous calendar year (Jan–Mar still belongs to the prior fiscal year).
const fiscalYearStart = (d: Dayjs): Dayjs => {
  const year = d.month() >= 3 ? d.year() : d.year() - 1;
  return dayjs(new Date(year, 3, 1)).startOf("day");
};

// YTD — first of the current fiscal year through today. When today *is* the
// first of the fiscal year there's no elapsed range yet, so fall back to the
// whole previous fiscal year (e.g. 01-Apr-2026 → 01-Apr-2025 … 31-Mar-2026).
const ytdRange = (): [Dayjs, Dayjs] => {
  const today = dayjs().startOf("day");
  const start = fiscalYearStart(today);
  if (today.isSame(start, "day")) {
    return [start.subtract(1, "year"), start.subtract(1, "day")];
  }
  return [start, today];
};

// MTD — first of the current month through today. When today *is* the first of
// the month, fall back to the whole current month (first → last day).
const mtdRange = (): [Dayjs, Dayjs] => {
  const today = dayjs().startOf("day");
  const start = today.startOf("month");
  if (today.isSame(start, "day")) {
    return [start, today.endOf("month").startOf("day")];
  }
  return [start, today];
};

export interface RangePreset {
  label: string;
  value: () => [Dayjs, Dayjs];
}

// Presets for the day-granularity RangePicker.
export const dateRangePresets: RangePreset[] = [
  { label: "YTD", value: ytdRange },
  { label: "MTD", value: mtdRange },
];

// Presets for the month-granularity RangePicker. Same anchors as the day picker
// — the month picker just snaps each bound to its month.
export const monthRangePresets: RangePreset[] = [
  { label: "YTD", value: () => ytdRange().map((d) => d.startOf("month")) as [Dayjs, Dayjs] },
  { label: "MTD", value: () => mtdRange().map((d) => d.startOf("month")) as [Dayjs, Dayjs] },
];
