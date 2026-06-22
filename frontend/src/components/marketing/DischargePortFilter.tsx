import { SelectFilter } from "../filters/SelectFilter";

// Discharge Port dropdown for the Ocean Freight page. A port select sourced
// from /filters (same as the Finance PortFilter), but with no "All" option —
// a concrete port is always selected.
export const DischargePortFilter = ({
  value,
  onChange,
}: {
  value: string | undefined;
  onChange: (v: string | undefined) => void;
}) => (
  <SelectFilter
    label="Discharge Port"
    kind="ports"
    value={value}
    onChange={onChange}
    allowAll={false}
    width={180}
  />
);
