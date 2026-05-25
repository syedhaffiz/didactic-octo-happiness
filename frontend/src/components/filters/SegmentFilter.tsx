import { SelectFilter } from "./SelectFilter";
import { filtersApi } from "../../api/filters";

export const SegmentFilter = ({
  value,
  onChange,
}: {
  value: string | undefined;
  onChange: (v: string | undefined) => void;
}) => (
  <SelectFilter
    label="Segment"
    value={value}
    onChange={onChange}
    cacheKey="filters:segments"
    fetcher={filtersApi.segments}
  />
);
