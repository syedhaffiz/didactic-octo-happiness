import { Select } from "antd";

// Generic time-range dropdown (1W / 1M / 3M / 1Y) shared across modules.
export type TimeRange = "1W" | "1M" | "3M" | "1Y";

export const DEFAULT_RANGE: TimeRange = "1M";

export const isRange = (v: string | undefined): v is TimeRange =>
  v === "1W" || v === "1M" || v === "3M" || v === "1Y";

const RANGE_OPTIONS: { value: TimeRange; label: string }[] = [
  { value: "1W", label: "1 Week" },
  { value: "1M", label: "1 Month" },
  { value: "3M", label: "3 Months" },
  { value: "1Y", label: "1 Year" },
];

export const RangeSelect = ({
  value,
  onChange,
}: {
  value: TimeRange;
  onChange: (range: TimeRange) => void;
}) => (
  <Select
    size="small"
    value={value}
    onChange={onChange}
    options={RANGE_OPTIONS}
    style={{ width: 120 }}
  />
);
