import { Select } from "antd";
import { FilterField } from "./FilterField";

export interface MultiSelectOption {
  value: string;
  label: string;
}

interface Props {
  label: string;
  value: string[];
  onChange: (values: string[]) => void;
  options: MultiSelectOption[];
  width?: number;
  placeholder?: string;
  loading?: boolean;
}

// Multiselect dropdown (label above the control) for the Market Share Year and
// Quarter filters. Empty selection means "All".
export const MultiSelectFilter = ({
  label,
  value,
  onChange,
  options,
  width = 200,
  placeholder = "All",
  loading = false,
}: Props) => (
  <FilterField label={label} width={width}>
    <Select
      mode="multiple"
      allowClear
      value={value}
      onChange={onChange}
      options={options}
      loading={loading}
      placeholder={placeholder}
      maxTagCount="responsive"
      style={{ width: "100%" }}
    />
  </FilterField>
);
