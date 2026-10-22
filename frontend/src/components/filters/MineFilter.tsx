import { SelectFilter } from "./SelectFilter";

export const MineFilter = ({
  value,
  onChange,
}: {
  value: string | undefined;
  onChange: (v: string | undefined) => void;
}) => <SelectFilter label="Mine" kind="mines" value={value} onChange={onChange} />;
