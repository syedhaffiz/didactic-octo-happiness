import { Badge, Button, Space, Tooltip } from "antd";
import { FilterOutlined, ReloadOutlined, UploadOutlined } from "@ant-design/icons";
import { TimeFrameFilter } from "../filters/TimeFrameFilter";
import { MonthFilter } from "../filters/MonthFilter";
import type { InventoryDaysFiltersState } from "../../utils/useInventoryDaysFilters";

interface Props {
  filters: InventoryDaysFiltersState;
  onOpenFilters: () => void;
  /** Placeholder — the Excel export is not wired up yet. */
  onExport: () => void;
  onRefresh: () => void;
}

// Inventory Days header row: the Time Frame look-back preset and Month picker,
// the button that opens the Filters side-panel (Zone / Port / Origin / Segment,
// badged with its active count), plus (placeholder) Excel export and refresh.
export const InventoryDaysFilters = ({ filters, onOpenFilters, onExport, onRefresh }: Props) => (
  <Space size="middle" align="end" wrap>
    <TimeFrameFilter value={filters.timeFrame} onChange={filters.setTimeFrame} />
    <MonthFilter value={filters.month} onChange={filters.setMonth} />
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
