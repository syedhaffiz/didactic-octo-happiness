import { Select } from "antd";
import { useQuery } from "@tanstack/react-query";
import { FilterField } from "./FilterField";

const ALL = "__all__";

interface SelectFilterProps {
  label: string;
  value: string | undefined;
  onChange: (v: string | undefined) => void;
  queryKey: string[];
  fetcher: () => Promise<string[]>;
  width?: number;
}

export const SelectFilter = ({
  label,
  value,
  onChange,
  queryKey,
  fetcher,
  width = 160,
}: SelectFilterProps) => {
  const { data } = useQuery({ queryKey, queryFn: fetcher, staleTime: 5 * 60_000 });

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
