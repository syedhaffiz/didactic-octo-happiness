import { Badge, Button, Space, Tooltip } from "antd";
import { FilterOutlined, ReloadOutlined, UploadOutlined } from "@ant-design/icons";
import { DateRangeFilter } from "../../DateRangeFilter";
import type { AgingFiltersState } from "../../../utils/useAgingFilters";

interface Props {
  filters: AgingFiltersState;
  onOpenFilters: () => void;
  /** Placeholder — the Excel export is not wired up yet. */
  onExport: () => void;
  onRefresh: () => void;
}

// Top control row: a date range, the button that opens the Filters side-panel
// (badged with its active count), and the (placeholder) Excel export + refresh
// actions.
export const AgingFilters = ({ filters, onOpenFilters, onExport, onRefresh }: Props) => (
  <Space size="middle" align="end" wrap>
    <DateRangeFilter value={filters.dateRange} onChange={filters.setDateRange} />
    <Badge count={filters.drawerActiveCount} size="small">
      <Button icon={<FilterOutlined />} onClick={onOpenFilters}>
        Filters
      </Button>
    </Badge>
    <Tooltip title="Export to Excel">
      <Button icon={<UploadOutlined />} onClick={onExport} aria-label="Export to Excel" />
    </Tooltip>
    <Tooltip title="Refresh">
      <Button icon={<ReloadOutlined />} onClick={onRefresh} aria-label="Refresh" />
    </Tooltip>
  </Space>
);
