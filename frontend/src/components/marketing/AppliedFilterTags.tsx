import { FilterChips, type FilterChip } from "../FilterChips";
import {
  MS_DRAWER_FIELDS,
  type MarketShareFiltersState,
  type MsMultiKey,
  type MsSingleKey,
} from "../../utils/useMarketShareFilters";
import type { MarketShareFilterOptions, FilterRef } from "../../types/marketing";

const QUARTER_LABELS: Record<string, string> = { q1: "Q1", q2: "Q2", q3: "Q3", q4: "Q4" };

const nameOf = (list: FilterRef[] | undefined, id: string) =>
  list?.find((o) => o.id === id)?.name ?? id;

interface Props {
  filters: MarketShareFiltersState;
  options?: MarketShareFilterOptions;
}

// The active-filter tag bar. Multi-select filters render one pill per selected
// value (never grouped) so each value can be removed on its own; single filters
// render one pill.
export const AppliedFilterTags = ({ filters, options }: Props) => {
  const tags: FilterChip[] = [];

  // One pill per selected value of a multiselect filter.
  const pushMulti = (
    key: MsMultiKey,
    label: string,
    resolve: (id: string) => string,
  ) => {
    const vals = filters.multi[key];
    vals.forEach((id) => {
      tags.push({
        key: `${key}:${id}`,
        label,
        value: resolve(id),
        onClose: () => filters.setMulti(key, vals.filter((v) => v !== id)),
      });
    });
  };

  pushMulti("fiscalYears", "Year", (id) => nameOf(options?.fiscalYears, id));
  pushMulti("quarters", "Quarter", (q) => QUARTER_LABELS[q] ?? q);

  if (filters.dateRange) {
    const [from, to] = filters.dateRange;
    tags.push({
      key: "dateRange",
      label: "Date Range",
      value: `${from.format("DD MMM YY")} – ${to.format("DD MMM YY")}`,
      onClose: () => filters.setDateRange(null),
    });
  }

  for (const { key, label, optionsKey, multi } of MS_DRAWER_FIELDS) {
    const list = options?.[optionsKey];
    if (multi) {
      pushMulti(key as MsMultiKey, label, (id) => nameOf(list, id));
    } else {
      const id = filters.single[key as MsSingleKey];
      if (id) {
        tags.push({
          key,
          label,
          value: nameOf(list, id),
          onClose: () => filters.setSingle(key as MsSingleKey, undefined),
        });
      }
    }
  }

  return <FilterChips chips={tags} onClearAll={filters.clearAll} />;
};
