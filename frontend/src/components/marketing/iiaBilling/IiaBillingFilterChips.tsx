import { FilterChips, type FilterChip } from "../../FilterChips";
import { QUARTER_OPTIONS } from "../../filters/quarterOptions";
import {
  IIA_DRAWER_FIELDS,
  type IiaBillingFiltersState,
  type IiaMultiKey,
} from "../../../utils/useIiaBillingFilters";
import type { FilterRef, IiaBillingFilterOptions } from "../../../types/marketing";

const nameOf = (list: { value: string; label: string }[], id: string) =>
  list.find((o) => o.value === id)?.label ?? id;

const toOptions = (list: FilterRef[] | undefined) =>
  (list ?? []).map((o) => ({ value: o.id, label: o.name }));

interface Props {
  filters: IiaBillingFiltersState;
  options?: IiaBillingFilterOptions;
}

// The "Applied Filters" bar: one removable chip per selected value of every
// filter (top bar + side-panel), plus the date range.
export const IiaBillingFilterChips = ({ filters, options }: Props) => {
  const chips: FilterChip[] = [];

  const pushMulti = (key: IiaMultiKey, label: string, list: { value: string; label: string }[]) => {
    const vals = filters.multi[key];
    vals.forEach((id) =>
      chips.push({
        key: `${key}:${id}`,
        label,
        value: nameOf(list, id),
        onClose: () => filters.setMulti(key, vals.filter((v) => v !== id)),
      }),
    );
  };

  pushMulti("fiscalYears", "Fiscal Year", toOptions(options?.fiscalYears));
  pushMulti("quarters", "Quarter", QUARTER_OPTIONS);

  if (filters.dateRange) {
    const [from, to] = filters.dateRange;
    chips.push({
      key: "dateRange",
      label: "Date Range",
      value: `${from.format("DD MMM YY")} – ${to.format("DD MMM YY")}`,
      onClose: () => filters.setDateRange(null),
    });
  }

  for (const f of IIA_DRAWER_FIELDS) pushMulti(f.key, f.label, toOptions(options?.[f.optionsKey]));

  return <FilterChips chips={chips} onClearAll={filters.clearAll} />;
};
