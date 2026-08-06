import { Badge, Button, Space } from "antd";
import { FilterOutlined } from "@ant-design/icons";
import { DateRangeFilter } from "../DateRangeFilter";
import { MultiSelectFilter } from "../filters/MultiSelectFilter";
import type { MarketShareFiltersState } from "../../utils/useMarketShareFilters";
import type { FilterRef } from "../../types/marketing";

// Quarter is a fixed list (not API-driven).
const QUARTER_OPTIONS = [
  { value: "q1", label: "Q1" },
  { value: "q2", label: "Q2" },
  { value: "q3", label: "Q3" },
  { value: "q4", label: "Q4" },
];

interface Props {
  filters: MarketShareFiltersState;
  fiscalYearOptions: FilterRef[];
  onOpenFilters: () => void;
}

// Top control row: multiselect Year + Quarter, a date range, and the button
// that opens the Filters side-panel (badged with the active side-panel count).
export const MarketShareFilters = ({ filters, fiscalYearOptions, onOpenFilters }: Props) => (
  <Space size="middle" align="end" wrap>
    <MultiSelectFilter
      label="Year"
      value={filters.multi.fiscalYears}
      onChange={(v) => filters.setMulti("fiscalYears", v)}
      options={fiscalYearOptions.map((o) => ({ value: o.id, label: o.name }))}
      width={180}
    />
    <MultiSelectFilter
      label="Quarter"
      value={filters.multi.quarters}
      onChange={(v) => filters.setMulti("quarters", v)}
      options={QUARTER_OPTIONS}
      width={150}
    />
    <DateRangeFilter value={filters.dateRange} onChange={filters.setDateRange} />
    <Badge count={filters.drawerActiveCount} size="small">
      <Button icon={<FilterOutlined />} onClick={onOpenFilters}>
        Filters
      </Button>
    </Badge>
  </Space>
);
