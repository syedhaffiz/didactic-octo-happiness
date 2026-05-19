import { Select } from "antd";
import { useQuery } from "@tanstack/react-query";
import { useBrandTokens } from "../../theme/useBrandTokens";

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
  const t = useBrandTokens();
  const { data } = useQuery({ queryKey, queryFn: fetcher, staleTime: 5 * 60_000 });

  const options = [
    { value: "__all__", label: "All" },
    ...(data ?? []).map((v) => ({ value: v, label: v })),
  ];

  return (
    <div style={{ minWidth: width }}>
      <div style={{ fontSize: 11, color: t.textSecondary, marginBottom: 2 }}>{label}</div>
      <Select
        value={value ?? "__all__"}
        onChange={(v) => onChange(v === "__all__" ? undefined : v)}
        options={options}
        style={{ width: "100%" }}
        placeholder="All"
      />
    </div>
  );
};
