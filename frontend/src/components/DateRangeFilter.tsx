import { DatePicker } from "antd";
import type { Dayjs } from "dayjs";
import { FilterField } from "./filters/FilterField";

const { RangePicker } = DatePicker;

export interface DateRangeFilterProps {
  value?: [Dayjs | null, Dayjs | null] | null;
  onChange: (value: [Dayjs | null, Dayjs | null] | null) => void;
}

export const DateRangeFilter = ({ value, onChange }: DateRangeFilterProps) => (
  <FilterField label="Date Range" width={220}>
    <RangePicker
      value={value ?? null}
      onChange={(v) => onChange(v as [Dayjs | null, Dayjs | null] | null)}
      placeholder={["Select", ""]}
      format="DD MMM YY"
      allowEmpty={[true, true]}
      style={{ width: "100%" }}
    />
  </FilterField>
);
