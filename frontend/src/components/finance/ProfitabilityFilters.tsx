import { Button, Segmented, Space, Tooltip } from "antd";
import { DownloadOutlined, ReloadOutlined } from "@ant-design/icons";
import type { Dayjs } from "dayjs";
import { ZoneFilter } from "../filters/ZoneFilter";
import { DateRangeFilter } from "../DateRangeFilter";
import type { Currency } from "../../types/finance";

interface Props {
  zone: string | undefined;
  dateValue: [Dayjs, Dayjs];
  currency: Currency;
  onZoneChange: (v: string | undefined) => void;
  onDateChange: (v: [Dayjs | null, Dayjs | null] | null) => void;
  onCurrencyChange: (v: Currency) => void;
  /** Placeholder — the Excel export is not wired up yet. */
  onExport: () => void;
  onReset: () => void;
}

// Net Margin Profitability header filter row: Zone / Date Range dropdowns, an
// INR↔USD currency toggle, a (placeholder) download button, and a reset-to-
// default button. Presentational — all state is owned by the page.
export const ProfitabilityFilters = ({
  zone,
  dateValue,
  currency,
  onZoneChange,
  onDateChange,
  onCurrencyChange,
  onExport,
  onReset,
}: Props) => (
  <Space size="middle" align="end" wrap>
    <ZoneFilter value={zone} onChange={onZoneChange} />
    <DateRangeFilter value={dateValue} onChange={onDateChange} />
    <Segmented<Currency>
      value={currency}
      onChange={onCurrencyChange}
      options={[
        { label: "INR", value: "INR" },
        { label: "USD", value: "USD" },
      ]}
    />
    <Tooltip title="Download">
      <Button icon={<DownloadOutlined />} onClick={onExport} aria-label="Download" />
    </Tooltip>
    <Tooltip title="Reset filters">
      <Button icon={<ReloadOutlined />} onClick={onReset} aria-label="Reset filters" />
    </Tooltip>
  </Space>
);
