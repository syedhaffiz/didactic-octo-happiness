import { Select } from "antd";
import { FilterField } from "./FilterField";
import { useApi } from "../../api/useApi";
import { filtersApi, type FiltersResponse } from "../../api/filters";

const ALL = "__all__";

// All filters in the response are arrays of objects. Each has its own
// value/label fields — we extract { value, label } per filter kind so
// SelectFilter doesn't care about the shape.
const optionExtractors: {
  [K in keyof FiltersResponse]: (
    item: FiltersResponse[K][number],
  ) => { value: string; label: string };
} = {
  ports: (p) => ({ value: p.id, label: p.name }),
  dischargePorts: (p) => ({ value: p.id, label: p.name }),
  segments: (s) => ({ value: s.id, label: s.name }),
  zones: (z) => ({ value: z.id, label: z.name }),
  origins: (o) => ({ value: o.id, label: o.name }),
  grades: (g) => ({ value: g.id, label: g.name }),
  indexNames: (i) => ({ value: i.code_id, label: i.index_name }),
};

interface SelectFilterProps {
  label: string;
  // Which slice of the shared /filters response to render. All instances
  // share the same fetch via `useApi`'s reference cache — only the first
  // mount makes the network call.
  kind: keyof FiltersResponse;
  // The selected `id` (or `code_id` for indexNames). Stored in the URL.
  value: string | undefined;
  onChange: (v: string | undefined) => void;
  width?: number;
  // When false, the "All" option is omitted and the select always holds a
  // concrete value (the caller supplies a default). Defaults to true.
  allowAll?: boolean;
}

export const SelectFilter = ({
  label,
  kind,
  value,
  onChange,
  width = 160,
  allowAll = true,
}: SelectFilterProps) => {
  const { data } = useApi(["filters"], filtersApi.all, { cache: true });

  // Cast through the discriminated extractor table. TS can't narrow the
  // mapped-tuple correlation here, but the runtime correspondence is
  // direct: items[kind] is fed to the matching extractor.
  const items = (data?.[kind] ?? []) as FiltersResponse[typeof kind];
  const extract = optionExtractors[kind] as (item: unknown) => {
    value: string;
    label: string;
  };

  const baseOptions = items.map((item) => extract(item));
  const options = allowAll
    ? [{ value: ALL, label: "All" }, ...baseOptions]
    : baseOptions;

  return (
    <FilterField label={label} width={width}>
      <Select
        value={allowAll ? value ?? ALL : value}
        onChange={(v) => onChange(v === ALL ? undefined : v)}
        options={options}
        style={{ width: "100%" }}
        placeholder={allowAll ? "All" : undefined}
      />
    </FilterField>
  );
};
