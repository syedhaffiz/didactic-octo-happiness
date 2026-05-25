import { SelectFilter } from "./SelectFilter";
import { filtersApi } from "../../api/filters";

export const OriginFilter = ({
  value,
  onChange,
}: {
  value: string | undefined;
  onChange: (v: string | undefined) => void;
}) => (
  <SelectFilter
    label="Origin"
    value={value}
    onChange={onChange}
    cacheKey="filters:origins"
    fetcher={filtersApi.origins}
  />
);
