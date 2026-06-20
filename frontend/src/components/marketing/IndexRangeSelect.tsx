import { Select } from "antd";
import type { IndexRange } from "../../types/marketing";

export const DEFAULT_INDEX_RANGE: IndexRange = "1";

export const isIndexRange = (v: string | undefined): v is IndexRange =>
  v === "1" || v === "2";

// 1 Month / 2 Months window for the Index Movement cards. The values are the
// raw digits so URL params read cleanly (e.g. ?range_ici=2).
export const IndexRangeSelect = ({
  value,
  onChange,
}: {
  value: IndexRange;
  onChange: (next: IndexRange) => void;
}) => (
  <Select
    size="small"
    value={value}
    onChange={onChange}
    options={[
      { value: "1", label: "1 Month" },
      { value: "2", label: "2 Months" },
    ]}
    style={{ width: 130 }}
  />
);
