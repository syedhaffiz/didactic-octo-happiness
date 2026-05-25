import { SelectFilter } from "./SelectFilter";
import { filtersApi } from "../../api/filters";

export const ZoneFilter = ({
  value,
  onChange,
}: {
  value: string | undefined;
  onChange: (v: string | undefined) => void;
}) => (
  <SelectFilter
    label="Zone"
    value={value}
    onChange={onChange}
    cacheKey="filters:zones"
    fetcher={filtersApi.zones}
  />
);
