import { Badge, Button, Space } from "antd";
import { FilterOutlined } from "@ant-design/icons";
import { DateRangeFilter } from "../../DateRangeFilter";
import { MultiSelectFilter } from "../../filters/MultiSelectFilter";
import { QUARTER_OPTIONS } from "../../filters/quarterOptions";
import { toSelectOptions } from "../../filters/refFilterFields";
import type { IiaBillingFiltersState } from "../../../utils/useIiaBillingFilters";
import type { FilterRef } from "../../../types/marketing";

interface Props {
  filters: IiaBillingFiltersState;
  fiscalYearOptions?: FilterRef[];
  onOpenFilters: () => void;
}

// Top control row: multiselect Fiscal Year + Quarter, a date range (fiscal
// YTD by default), and the button that opens the Filters side-panel (badged
// with its active count). Year/Quarter and the Date Range are mutually
// exclusive: a period disables the picker, and a picked range disables the
// period selects (the YTD default doesn't).
export const IiaBillingFilters = ({ filters, fiscalYearOptions, onOpenFilters }: Props) => {
  const dateActive = filters.isCustomRange;

  return (
    <Space size="middle" align="end" wrap>
      <MultiSelectFilter
        label="Fiscal Year"
        value={filters.multi.fiscalYears}
        onChange={(v) => filters.setMulti("fiscalYears", v)}
        options={toSelectOptions(fiscalYearOptions)}
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
        disabled={filters.periodActive}
      />
      <Badge count={filters.drawerActiveCount} size="small">
        <Button icon={<FilterOutlined />} onClick={onOpenFilters}>
          Filters
        </Button>
      </Badge>
    </Space>
  );
};
