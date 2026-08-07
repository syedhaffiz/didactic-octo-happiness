import { DatePicker } from "antd";
import type { Dayjs } from "dayjs";
import { FilterField } from "./filters/FilterField";
import { dateRangePresets } from "../utils/datePresets";

const { RangePicker } = DatePicker;

export interface DateRangeFilterProps {
  value?: [Dayjs | null, Dayjs | null] | null;
  onChange: (value: [Dayjs | null, Dayjs | null] | null) => void;
  disabled?: boolean;
}

export const DateRangeFilter = ({ value, onChange, disabled = false }: DateRangeFilterProps) => (
  <FilterField label="Date Range" width={220}>
    <RangePicker
      value={value ?? null}
      onChange={(v) => onChange(v as [Dayjs | null, Dayjs | null] | null)}
      presets={dateRangePresets}
      placeholder={["Select", ""]}
      format="DD MMM YY"
      allowEmpty={[true, true]}
      disabled={disabled}
      style={{ width: "100%" }}
    />
  </FilterField>
);
