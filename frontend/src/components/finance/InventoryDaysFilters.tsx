import { Button, Space, Tooltip } from "antd";
import { ReloadOutlined, UploadOutlined } from "@ant-design/icons";
import type { Dayjs } from "dayjs";
import { ZoneFilter } from "../filters/ZoneFilter";
import { PortFilter } from "../filters/PortFilter";
import { OriginFilter } from "../filters/OriginFilter";
import { SegmentFilter } from "../filters/SegmentFilter";
import { DateRangeFilter } from "../DateRangeFilter";

interface Props {
  zone: string | undefined;
  port: string | undefined;
  origin: string | undefined;
  segment: string | undefined;
  dateValue: [Dayjs, Dayjs];
  onZoneChange: (v: string | undefined) => void;
  onPortChange: (v: string | undefined) => void;
  onOriginChange: (v: string | undefined) => void;
  onSegmentChange: (v: string | undefined) => void;
  onDateChange: (v: [Dayjs | null, Dayjs | null] | null) => void;
  /** Placeholder — the Excel export is not wired up yet. */
  onExport: () => void;
  onRefresh: () => void;
}

// Inventory Days header filter row: Zone / Port / Origin / Segment / Date Range
// dropdowns plus (placeholder) Excel export and refresh actions. Presentational
// — all state is owned by the page.
export const InventoryDaysFilters = ({
  zone,
  port,
  origin,
  segment,
  dateValue,
  onZoneChange,
  onPortChange,
  onOriginChange,
  onSegmentChange,
  onDateChange,
  onExport,
  onRefresh,
}: Props) => (
  <Space size="middle" align="end" wrap>
    <ZoneFilter value={zone} onChange={onZoneChange} />
    <PortFilter value={port} onChange={onPortChange} />
    <OriginFilter value={origin} onChange={onOriginChange} />
    <SegmentFilter value={segment} onChange={onSegmentChange} />
    <DateRangeFilter value={dateValue} onChange={onDateChange} />
    <Tooltip title="Export to Excel">
      <Button icon={<UploadOutlined />} onClick={onExport} aria-label="Export to Excel" />
    </Tooltip>
    <Tooltip title="Refresh">
      <Button icon={<ReloadOutlined />} onClick={onRefresh} aria-label="Refresh" />
    </Tooltip>
  </Space>
);
