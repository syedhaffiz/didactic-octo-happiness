import { Select } from "antd";
import { FilterField } from "./FilterField";
import { useApi } from "../../api/useApi";

const ALL = "__all__";

interface SelectFilterProps {
  label: string;
  value: string | undefined;
  onChange: (v: string | undefined) => void;
  cacheKey: string;
  fetcher: () => Promise<string[]>;
  width?: number;
}

export const SelectFilter = ({
  label,
  value,
  onChange,
  cacheKey,
  fetcher,
  width = 160,
}: SelectFilterProps) => {
  const { data } = useApi([cacheKey], fetcher, { cache: true });

  const options = [
    { value: ALL, label: "All" },
    ...(data ?? []).map((v) => ({ value: v, label: v })),
  ];

  return (
    <FilterField label={label} width={width}>
      <Select
        value={value ?? ALL}
        onChange={(v) => onChange(v === ALL ? undefined : v)}
        options={options}
        style={{ width: "100%" }}
        placeholder="All"
      />
    </FilterField>
  );
};
