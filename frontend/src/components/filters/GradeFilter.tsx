import { SelectFilter } from "./SelectFilter";
import { filtersApi } from "../../api/filters";

export const GradeFilter = ({
  value,
  onChange,
}: {
  value: string | undefined;
  onChange: (v: string | undefined) => void;
}) => (
  <SelectFilter
    label="Grade"
    value={value}
    onChange={onChange}
    queryKey={["filters", "grades"]}
    fetcher={filtersApi.grades}
  />
);
