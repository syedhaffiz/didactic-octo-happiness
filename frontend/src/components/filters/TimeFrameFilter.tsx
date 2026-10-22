import { Select } from "antd";
import { FilterField } from "./FilterField";
import { TIME_FRAME_OPTIONS } from "./timeFrame";
import type { TimeFrame } from "../../types/finance";

// Time Frame look-back dropdown. Options, the default, and the type guard live
// in ./timeFrame so this file only exports the component.
export const TimeFrameFilter = ({
  value,
  onChange,
}: {
  value: TimeFrame;
  onChange: (v: TimeFrame) => void;
}) => (
  <FilterField label="Time Frame" width={150}>
    <Select<TimeFrame>
      value={value}
      onChange={onChange}
      options={TIME_FRAME_OPTIONS}
      style={{ width: "100%" }}
    />
  </FilterField>
);
