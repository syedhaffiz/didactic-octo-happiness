import { SelectFilter } from "./SelectFilter";
import { filtersApi } from "../../api/filters";

export const PortFilter = ({
  value,
  onChange,
}: {
  value: string | undefined;
  onChange: (v: string | undefined) => void;
}) => (
  <SelectFilter
    label="Port"
    value={value}
    onChange={onChange}
    queryKey={["filters", "ports"]}
    fetcher={filtersApi.ports}
  />
);
