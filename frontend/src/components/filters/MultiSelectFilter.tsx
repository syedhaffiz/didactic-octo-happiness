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
  disabled?: boolean;
}

// Multiselect dropdown (label above the control). Used by the top-bar Year /
// Quarter filters and by MultiSelectFilterDrawer. Empty selection means "All";
// typing searches the option labels.
export const MultiSelectFilter = ({
  label,
  value,
  onChange,
  options,
  width = 200,
  placeholder = "All",
  loading = false,
  disabled = false,
}: Props) => (
  <FilterField label={label} width={width}>
    <Select
      mode="multiple"
      allowClear
      value={value}
      onChange={onChange}
      options={options}
      loading={loading}
      disabled={disabled}
      placeholder={placeholder}
      maxTagCount="responsive"
      optionFilterProp="label"
      style={{ width: "100%" }}
    />
  </FilterField>
);
