import { DatePicker } from "antd";
import type { Dayjs } from "dayjs";
import { FilterField } from "./filters/FilterField";

const { RangePicker } = DatePicker;

export interface MonthRangeFilterProps {
  value?: [Dayjs | null, Dayjs | null] | null;
  onChange: (value: [Dayjs | null, Dayjs | null] | null) => void;
}

// Month-granularity range picker. Same shape as DateRangeFilter but with
// `picker="month"`, used where filtering is monthly (e.g. Vessel Profitability).
export const MonthRangeFilter = ({ value, onChange }: MonthRangeFilterProps) => (
  <FilterField label="Month Range" width={240}>
    <RangePicker
      picker="month"
      value={value ?? null}
      onChange={(v) => onChange(v as [Dayjs | null, Dayjs | null] | null)}
      format="MMM YY"
      allowEmpty={[true, true]}
      style={{ width: "100%" }}
    />
  </FilterField>
);
