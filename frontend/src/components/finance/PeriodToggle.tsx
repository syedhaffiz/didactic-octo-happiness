/* eslint-disable react-refresh/only-export-components */
import { Select } from "antd";
import dayjs, { type Dayjs } from "dayjs";

// Revenue-breakdown date-range preset. The date range is the single source of
// truth; this preset is *derived* from it (see presetOf) so that manually
// picking a custom range automatically reads as "None". Selecting YTD/MTD simply
// applies the matching computed range.
export type RevenuePreset = "none" | "ytd" | "mtd";

const FMT = "YYYY-MM-DD";

// YTD: Indian fiscal year (starts 1 Apr) → today.
export const ytdRange = (today: Dayjs): [Dayjs, Dayjs] => {
  const fyStartYear = today.month() >= 3 ? today.year() : today.year() - 1; // month() 0-based; 3 = Apr
  return [dayjs(`${fyStartYear}-04-01`), today];
};

// MTD: 1st of the current month → today. Exception: on the 1st, start from the
// 1st of the previous month so the window spans more than a single day.
export const mtdRange = (today: Dayjs): [Dayjs, Dayjs] => {
  const start =
    today.date() === 1
      ? today.subtract(1, "month").startOf("month")
      : today.startOf("month");
  return [start, today];
};

// Which preset (if any) the current range corresponds to, compared by calendar
// day. Anything that isn't exactly the YTD or MTD window reads as "None".
export const presetOf = (
  range: [Dayjs, Dayjs] | null | undefined,
  today: Dayjs,
): RevenuePreset => {
  if (!range || !range[0] || !range[1]) return "none";
  const f = range[0].format(FMT);
  const t = range[1].format(FMT);
  const eq = (r: [Dayjs, Dayjs]) => r[0].format(FMT) === f && r[1].format(FMT) === t;
  if (eq(ytdRange(today))) return "ytd";
  if (eq(mtdRange(today))) return "mtd";
  return "none";
};

export const PeriodSelect = ({
  value,
  onChange,
}: {
  value: RevenuePreset;
  onChange: (next: RevenuePreset) => void;
}) => (
  <Select<RevenuePreset>
    value={value}
    onChange={onChange}
    options={[
      { value: "none", label: "None" },
      { value: "ytd", label: "YTD" },
      { value: "mtd", label: "MTD" },
    ]}
    style={{ width: 120 }}
  />
);
