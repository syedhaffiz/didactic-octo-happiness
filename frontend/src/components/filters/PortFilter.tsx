import { SelectFilter } from "./SelectFilter";

export const PortFilter = ({
  value,
  onChange,
}: {
  value: string | undefined;
  onChange: (v: string | undefined) => void;
}) => <SelectFilter label="Port" kind="ports" value={value} onChange={onChange} />;
