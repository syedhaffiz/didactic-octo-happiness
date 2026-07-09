import { Button, Segmented, Space, Tooltip } from "antd";
import { ReloadOutlined, UploadOutlined } from "@ant-design/icons";
import type { Dayjs } from "dayjs";
import { ZoneFilter } from "../filters/ZoneFilter";
import { RevenuePortFilter } from "../filters/RevenuePortFilter";
import { DateRangeFilter } from "../DateRangeFilter";
import type { Currency } from "../../types/finance";

interface Props {
  zone: string | undefined;
  port: string | undefined;
  dateValue: [Dayjs, Dayjs];
  currency: Currency;
  onZoneChange: (v: string | undefined) => void;
  onPortChange: (v: string | undefined) => void;
  onDateChange: (v: [Dayjs | null, Dayjs | null] | null) => void;
  onCurrencyChange: (v: Currency) => void;
  /** Placeholder — the Excel export is not wired up yet. */
  onExport: () => void;
  onReset: () => void;
}

// Revenue header filter row: Zone / Port / Date Range dropdowns, an INR↔USD
// currency toggle, a (placeholder) Excel export button, and a reset-to-default
// button. Presentational — all state is owned by the page.
export const RevenueFilters = ({
  zone,
  port,
  dateValue,
  currency,
  onZoneChange,
  onPortChange,
  onDateChange,
  onCurrencyChange,
  onExport,
  onReset,
}: Props) => (
  <Space size="middle" align="end" wrap>
    <ZoneFilter value={zone} onChange={onZoneChange} />
    <RevenuePortFilter zone={zone} value={port} onChange={onPortChange} />
    <DateRangeFilter value={dateValue} onChange={onDateChange} />
    <Segmented<Currency>
      value={currency}
      onChange={onCurrencyChange}
      options={[
        { label: "INR", value: "INR" },
        { label: "USD", value: "USD" },
      ]}
    />
    <Tooltip title="Export to Excel">
      <Button icon={<UploadOutlined />} onClick={onExport} aria-label="Export to Excel" />
    </Tooltip>
    <Tooltip title="Reset filters">
      <Button icon={<ReloadOutlined />} onClick={onReset} aria-label="Reset filters" />
    </Tooltip>
  </Space>
);
