import { SelectFilter } from "../filters/SelectFilter";

// Discharge Port dropdown for the Ocean Freight page. Sourced from the
// dedicated `dischargePorts` slice of /filters (distinct from the Finance
// `ports` list), with no "All" option — a concrete port is always selected.
export const DischargePortFilter = ({
  value,
  onChange,
}: {
  value: string | undefined;
  onChange: (v: string | undefined) => void;
}) => (
  <SelectFilter
    label="Discharge Port"
    kind="dischargePorts"
    value={value}
    onChange={onChange}
    allowAll={false}
    width={180}
  />
);
