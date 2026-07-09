import { Select } from "antd";
import { FilterField } from "./FilterField";
import { useApi } from "../../api/useApi";
import { filtersApi, type FilterRef } from "../../api/filters";

const ALL = "__all__";

interface Props {
  /** Currently selected zone id, or undefined for "All". */
  zone: string | undefined;
  value: string | undefined;
  onChange: (v: string | undefined) => void;
  width?: number;
}

// Zone-dependent Port filter. When no concrete zone is selected the dropdown
// offers only "All" (and is disabled); once a zone is picked it loads that
// zone's ports from /filters/ports. Kept separate from the generic
// SelectFilter because its options are fetched per-zone, not from the shared
// /filters payload.
export const RevenuePortFilter = ({ zone, value, onChange, width = 160 }: Props) => {
  // Only hits the network once a concrete zone is chosen; otherwise resolves to
  // an empty list so "All" is the sole option.
  const { data } = useApi(
    ["ports-by-zone", zone ?? "__none__"],
    () => (zone ? filtersApi.portsByZone(zone) : Promise.resolve([] as FilterRef[])),
  );

  const options = [
    { value: ALL, label: "All" },
    ...(zone ? (data ?? []).map((p) => ({ value: p.id, label: p.name })) : []),
  ];

  return (
    <FilterField label="Port" width={width}>
      <Select
        value={value ?? ALL}
        onChange={(v) => onChange(v === ALL ? undefined : v)}
        options={options}
        disabled={!zone}
        style={{ width: "100%" }}
        placeholder="All"
      />
    </FilterField>
  );
};
