import { DatePicker } from "antd";
import type { Dayjs } from "dayjs";
import { FilterField } from "./FilterField";

// Single-month picker. Always holds a value (clearing is disabled) — the page
// resolves the default month. Used by the Inventory Days filter row.
export const MonthFilter = ({
  value,
  onChange,
}: {
  value: Dayjs;
  onChange: (v: Dayjs | null) => void;
}) => (
  <FilterField label="Month" width={180}>
    <DatePicker
      picker="month"
      value={value}
      onChange={onChange}
      allowClear={false}
      format="MMM YYYY"
      style={{ width: "100%" }}
    />
  </FilterField>
);
