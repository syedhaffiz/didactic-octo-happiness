import type { Dayjs } from "dayjs";
import { FilterTagBar, type FilterTagItem } from "../../filters/FilterTagBar";
import { filtersApi } from "../../../api/filters";
import { useApi } from "../../../api/useApi";
import { AGING_DRAWER_FIELDS, type AgingDrawerKey, type AgingDrawerValues } from "./agingFilterFields";

interface Props {
  values: AgingDrawerValues;
  dateRange: [Dayjs | null, Dayjs | null] | null;
  onRemove: (key: AgingDrawerKey) => void;
  onClearDate: () => void;
  onClearAll: () => void;
}

// Applied-filter pills for the Aging screen: one per active side-panel filter
// plus the date range. Ids resolve to display names via the shared (cached)
// /filters catalogue, falling back to the raw id until it loads.
export const AgingAppliedFilters = ({
  values,
  dateRange,
  onRemove,
  onClearDate,
  onClearAll,
}: Props) => {
  const { data: catalog } = useApi(["filters"], filtersApi.all, { cache: true });

  const tags: FilterTagItem[] = [];

  if (dateRange?.[0] && dateRange[1]) {
    tags.push({
      key: "dateRange",
      label: "Date Range",
      value: `${dateRange[0].format("DD MMM YY")} – ${dateRange[1].format("DD MMM YY")}`,
      onClose: onClearDate,
    });
  }

  for (const { key, label, kind } of AGING_DRAWER_FIELDS) {
    const id = values[key];
    if (!id) continue;
    tags.push({
      key,
      label,
      value: catalog?.[kind].find((o) => o.id === id)?.name ?? id,
      onClose: () => onRemove(key),
    });
  }

  return <FilterTagBar tags={tags} onClearAll={onClearAll} />;
};
