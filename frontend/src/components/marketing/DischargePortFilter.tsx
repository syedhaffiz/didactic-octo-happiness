import { Select } from "antd";
import { FilterField } from "../filters/FilterField";
import { DISCHARGE_PORT_LIST } from "../../mocks/marketing";

const options = DISCHARGE_PORT_LIST.map((p) => ({ value: p, label: p }));

// Discharge Port dropdown for the Ocean Freight page.
export const DischargePortFilter = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) => (
  <FilterField label="Discharge Port" width={180}>
    <Select value={value} onChange={onChange} options={options} style={{ width: "100%" }} />
  </FilterField>
);
