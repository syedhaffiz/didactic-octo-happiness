import { SelectFilter } from "./SelectFilter";

export const OriginFilter = ({
  value,
  onChange,
}: {
  value: string | undefined;
  onChange: (v: string | undefined) => void;
}) => <SelectFilter label="Origin" kind="origins" value={value} onChange={onChange} />;
