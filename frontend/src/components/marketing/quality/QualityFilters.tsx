import { Badge, Button, Segmented, Space } from "antd";
import { FilterOutlined } from "@ant-design/icons";
import { DateRangeFilter } from "../../DateRangeFilter";
import { MultiSelectFilter } from "../../filters/MultiSelectFilter";
import { QUARTER_OPTIONS } from "../../filters/quarterOptions";
import type { QualityFiltersState } from "../../../utils/useQualityFilters";
import type { Currency } from "../../../types/finance";

interface Props {
  filters: QualityFiltersState;
  onOpenFilters: () => void;
}

// Top control row: multiselect Quarter, a date range, the INR↔USD toggle and
// the button that opens the Filters side-panel (badged with its active count).
// Quarter and the Date Range are independent and apply together; the range
// defaults to fiscal YTD.
export const QualityFilters = ({ filters, onOpenFilters }: Props) => (
  <Space size="middle" align="end" wrap>
    <MultiSelectFilter
      label="Quarter"
      value={filters.multi.quarters}
      onChange={(v) => filters.setMulti("quarters", v)}
      options={QUARTER_OPTIONS}
      width={150}
    />
    <DateRangeFilter value={filters.dateRange} onChange={filters.setDateRange} />
    <Segmented<Currency>
      value={filters.currency}
      onChange={filters.setCurrency}
      options={[
        { label: "INR", value: "INR" },
        { label: "USD", value: "USD" },
      ]}
    />
    <Badge count={filters.drawerActiveCount} size="small">
      <Button icon={<FilterOutlined />} onClick={onOpenFilters}>
        Filters
      </Button>
    </Badge>
  </Space>
);
