import { SelectFilter } from "./SelectFilter";

export const SegmentFilter = ({
  value,
  onChange,
}: {
  value: string | undefined;
  onChange: (v: string | undefined) => void;
}) => <SelectFilter label="Segment" kind="segments" value={value} onChange={onChange} />;
