import { Segmented } from "antd";
import type { AgingMeasure } from "../../../types/finance";

const OPTIONS: { value: AgingMeasure; label: string }[] = [
  { value: "volume", label: "Volume" },
  { value: "value", label: "Value" },
];

// Volume / Value toggle above the Aging charts.
export const AgingMeasureSegmented = ({
  value,
  onChange,
}: {
  value: AgingMeasure;
  onChange: (measure: AgingMeasure) => void;
}) => (
  <Segmented<AgingMeasure>
    options={OPTIONS}
    value={value}
    onChange={onChange}
    style={{ marginBottom: 16 }}
  />
);
