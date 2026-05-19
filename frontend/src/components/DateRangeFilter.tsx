import { DatePicker } from "antd";
import type { Dayjs } from "dayjs";

const { RangePicker } = DatePicker;

export interface DateRangeFilterProps {
  value?: [Dayjs | null, Dayjs | null] | null;
  onChange: (value: [Dayjs | null, Dayjs | null] | null) => void;
}

export const DateRangeFilter = ({ value, onChange }: DateRangeFilterProps) => (
  <div style={{ minWidth: 220 }}>
    <div style={{ fontSize: 11, color: "#6B7280", marginBottom: 2 }}>Date Range</div>
    <RangePicker
      value={value ?? null}
      onChange={(v) => onChange(v as [Dayjs | null, Dayjs | null] | null)}
      placeholder={["Select", ""]}
      format="DD MMM YY"
      allowEmpty={[true, true]}
      style={{ width: "100%" }}
    />
  </div>
);

