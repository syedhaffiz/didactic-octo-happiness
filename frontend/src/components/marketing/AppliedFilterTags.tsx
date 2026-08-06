import { Space, Tag } from "antd";
import { useBrandTokens } from "../../theme/useBrandTokens";
import { MS_SINGLE_FIELDS, type MarketShareFiltersState } from "../../utils/useMarketShareFilters";
import type { MarketShareFilterOptions, FilterRef } from "../../types/marketing";

const QUARTER_LABELS: Record<string, string> = { q1: "Q1", q2: "Q2", q3: "Q3", q4: "Q4" };

const nameOf = (list: FilterRef[] | undefined, id: string) =>
  list?.find((o) => o.id === id)?.name ?? id;

interface TagItem {
  key: string;
  label: string;
  onClose: () => void;
}

interface Props {
  filters: MarketShareFiltersState;
  options?: MarketShareFilterOptions;
}

// The active-filter tag bar. Each active filter renders as a closable tag that
// clears just that filter; "Clear All" clears every filter at once.
export const AppliedFilterTags = ({ filters, options }: Props) => {
  const t = useBrandTokens();
  const tags: TagItem[] = [];

  if (filters.multi.fiscalYears.length) {
    tags.push({
      key: "fiscalYears",
      label: `Year: ${filters.multi.fiscalYears.map((id) => nameOf(options?.fiscalYears, id)).join(", ")}`,
      onClose: () => filters.setMulti("fiscalYears", []),
    });
  }
  if (filters.multi.quarters.length) {
    tags.push({
      key: "quarters",
      label: `Quarter: ${filters.multi.quarters.map((q) => QUARTER_LABELS[q] ?? q).join(", ")}`,
      onClose: () => filters.setMulti("quarters", []),
    });
  }
  if (filters.dateRange) {
    const [from, to] = filters.dateRange;
    tags.push({
      key: "dateRange",
      label: `Date Range: ${from.format("DD MMM YY")} – ${to.format("DD MMM YY")}`,
      onClose: () => filters.setDateRange(null),
    });
  }
  for (const { key, label, optionsKey } of MS_SINGLE_FIELDS) {
    const id = filters.single[key];
    if (id) {
      tags.push({
        key,
        label: `${label}: ${nameOf(options?.[optionsKey], id)}`,
        onClose: () => filters.setSingle(key, undefined),
      });
    }
  }

  if (tags.length === 0) return null;

  return (
    <Space size={[8, 8]} wrap align="center" style={{ marginBottom: 8 }}>
      <span style={{ fontSize: 13, color: t.textSecondary }}>Applied Filters:</span>
      {tags.map((tg) => (
        <Tag key={tg.key} closable onClose={tg.onClose} style={{ margin: 0 }}>
          {tg.label}
        </Tag>
      ))}
      <a onClick={filters.clearAll} style={{ cursor: "pointer" }}>
        Clear All
      </a>
    </Space>
  );
};
