import { Button, Space, Tooltip } from "antd";
import { ReloadOutlined, UploadOutlined } from "@ant-design/icons";
import type { Dayjs } from "dayjs";
import { ZoneFilter } from "../filters/ZoneFilter";
import { PortFilter } from "../filters/PortFilter";
import { OriginFilter } from "../filters/OriginFilter";
import { SegmentFilter } from "../filters/SegmentFilter";
import { TimeFrameFilter } from "../filters/TimeFrameFilter";
import { MonthFilter } from "../filters/MonthFilter";
import type { TimeFrame } from "../../types/finance";

interface Props {
  zone: string | undefined;
  port: string | undefined;
  origin: string | undefined;
  segment: string | undefined;
  timeFrame: TimeFrame;
  month: Dayjs;
  onZoneChange: (v: string | undefined) => void;
  onPortChange: (v: string | undefined) => void;
  onOriginChange: (v: string | undefined) => void;
  onSegmentChange: (v: string | undefined) => void;
  onTimeFrameChange: (v: TimeFrame) => void;
  onMonthChange: (v: Dayjs | null) => void;
  /** Placeholder — the Excel export is not wired up yet. */
  onExport: () => void;
  onRefresh: () => void;
}

// Inventory Days header filter row: Zone / Port / Origin / Segment dropdowns, a
// Time Frame look-back preset and a Month picker, plus (placeholder) Excel export
// and refresh actions. Presentational — all state is owned by the page.
export const InventoryDaysFilters = ({
  zone,
  port,
  origin,
  segment,
  timeFrame,
  month,
  onZoneChange,
  onPortChange,
  onOriginChange,
  onSegmentChange,
  onTimeFrameChange,
  onMonthChange,
  onExport,
  onRefresh,
}: Props) => (
  <Space size="middle" align="end" wrap>
    <ZoneFilter value={zone} onChange={onZoneChange} />
    <PortFilter value={port} onChange={onPortChange} />
    <OriginFilter value={origin} onChange={onOriginChange} />
    <SegmentFilter value={segment} onChange={onSegmentChange} />
    <TimeFrameFilter value={timeFrame} onChange={onTimeFrameChange} />
    <MonthFilter value={month} onChange={onMonthChange} />
    <Tooltip title="Export to Excel">
      <Button icon={<UploadOutlined />} onClick={onExport} aria-label="Export to Excel" />
    </Tooltip>
    <Tooltip title="Refresh">
      <Button icon={<ReloadOutlined />} onClick={onRefresh} aria-label="Refresh" />
    </Tooltip>
  </Space>
);
