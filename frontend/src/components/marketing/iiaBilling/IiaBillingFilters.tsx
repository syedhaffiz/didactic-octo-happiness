import { Badge, Button, Space } from "antd";
import { FilterOutlined } from "@ant-design/icons";
import { DateRangeFilter } from "../../DateRangeFilter";
import { MultiSelectFilter } from "../../filters/MultiSelectFilter";
import { QUARTER_OPTIONS } from "../../filters/quarterOptions";
import type { IiaBillingFiltersState } from "../../../utils/useIiaBillingFilters";
import type { FilterRef } from "../../../types/marketing";

interface Props {
  filters: IiaBillingFiltersState;
  fiscalYearOptions: FilterRef[];
  onOpenFilters: () => void;
}

// Top control row: multiselect Fiscal Year + Quarter, a date range, and the
// button that opens the Filters side-panel (badged with its active count).
// Year/Quarter and the Date Range are mutually exclusive — whichever side holds
// a value disables the other.
export const IiaBillingFilters = ({ filters, fiscalYearOptions, onOpenFilters }: Props) => {
  const periodActive =
    filters.multi.fiscalYears.length > 0 || filters.multi.quarters.length > 0;
  const dateActive = filters.dateRange != null;

  return (
    <Space size="middle" align="end" wrap>
      <MultiSelectFilter
        label="Fiscal Year"
        value={filters.multi.fiscalYears}
        onChange={(v) => filters.setMulti("fiscalYears", v)}
        options={fiscalYearOptions.map((o) => ({ value: o.id, label: o.name }))}
        width={180}
        disabled={dateActive}
      />
      <MultiSelectFilter
        label="Quarter"
        value={filters.multi.quarters}
        onChange={(v) => filters.setMulti("quarters", v)}
        options={QUARTER_OPTIONS}
        width={150}
        disabled={dateActive}
      />
      <DateRangeFilter
        value={filters.dateRange}
        onChange={filters.setDateRange}
        disabled={periodActive}
      />
      <Badge count={filters.drawerActiveCount} size="small">
        <Button icon={<FilterOutlined />} onClick={onOpenFilters}>
          Filters
        </Button>
      </Badge>
    </Space>
  );
};
