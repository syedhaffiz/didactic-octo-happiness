import { Badge, Button, Space, Tooltip } from "antd";
import { FilterOutlined, ReloadOutlined, UploadOutlined } from "@ant-design/icons";
import type { Dayjs } from "dayjs";
import { DateRangeFilter } from "../../DateRangeFilter";

interface Props {
  /** `null` = no range picked (shows the Start / End placeholders). */
  dateValue: [Dayjs | null, Dayjs | null] | null;
  onDateChange: (v: [Dayjs | null, Dayjs | null] | null) => void;
  /** Active side-panel filter count, shown as a badge on the Filters button. */
  activeFilterCount: number;
  onOpenFilters: () => void;
  /** Placeholder — the Excel export is not wired up yet. */
  onExport: () => void;
  onRefresh: () => void;
}

// Aging header control row: Date Range, the button that opens the Filters
// side-panel (Zone / Port / Origin / Segment / Mine), plus (placeholder) Excel
// export and refresh. Presentational — all state is owned by the page.
export const AgingFilters = ({
  dateValue,
  onDateChange,
  activeFilterCount,
  onOpenFilters,
  onExport,
  onRefresh,
}: Props) => (
  <Space size="middle" align="end" wrap>
    <DateRangeFilter value={dateValue} onChange={onDateChange} />
    <Badge count={activeFilterCount} size="small">
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
