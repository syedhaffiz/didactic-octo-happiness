import { Select } from "antd";
import { FilterField } from "./FilterField";
import { useApi } from "../../api/useApi";
import { filtersApi, type FiltersResponse } from "../../api/filters";

const ALL = "__all__";

interface SelectFilterProps {
  label: string;
  // Which slice of the shared /filters response to render. Every dropdown
  // shares the same fetch via `useApi`'s reference cache — only the first
  // mount makes the network call; the rest read from cache instantly.
  kind: keyof FiltersResponse;
  value: string | undefined;
  onChange: (v: string | undefined) => void;
  width?: number;
}

export const SelectFilter = ({
  label,
  kind,
  value,
  onChange,
  width = 160,
}: SelectFilterProps) => {
  const { data } = useApi(["filters"], filtersApi.all, { cache: true });
  const items = data?.[kind] ?? [];

  const options = [
    { value: ALL, label: "All" },
    ...items.map((v) => ({ value: v, label: v })),
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
