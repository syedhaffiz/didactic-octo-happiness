import { FilterChips, type FilterChip } from "../../FilterChips";
import {
  AGING_DRAWER_FIELDS,
  type AgingFiltersState,
} from "../../../utils/useAgingFilters";
import type { AgingFilterOptions } from "../../../types/finance";
import type { FilterRef } from "../../../types/marketing";

// Resolve an id to its display name; falls back to the id while options load
// (or if the id is unknown) so a chip is never blank.
const nameOf = (list: FilterRef[] | undefined, id: string) =>
  list?.find((o) => o.id === id)?.name ?? id;

interface Props {
  filters: AgingFiltersState;
  options?: AgingFilterOptions;
}

// The "Applied Filters" bar: the date range plus one removable chip per
// selected value of every side-panel filter.
export const AgingFilterChips = ({ filters, options }: Props) => {
  const chips: FilterChip[] = [];

  if (filters.dateRange) {
    const [from, to] = filters.dateRange;
    chips.push({
      key: "dateRange",
      label: "Date Range",
      value: `${from.format("DD MMM YY")} – ${to.format("DD MMM YY")}`,
      onClose: () => filters.setDateRange(null),
    });
  }

  for (const f of AGING_DRAWER_FIELDS) {
    const vals = filters.multi[f.key];
    vals.forEach((id) =>
      chips.push({
        key: `${f.key}:${id}`,
        label: f.label,
        value: nameOf(options?.[f.optionsKey], id),
        onClose: () => filters.setMulti(f.key, vals.filter((v) => v !== id)),
      }),
    );
  }

  return <FilterChips chips={chips} onClearAll={filters.clearAll} />;
};
