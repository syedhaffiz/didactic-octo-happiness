import { SelectFilter } from "./SelectFilter";

export const ZoneFilter = ({
  value,
  onChange,
}: {
  value: string | undefined;
  onChange: (v: string | undefined) => void;
}) => <SelectFilter label="Zone" kind="zones" value={value} onChange={onChange} />;
