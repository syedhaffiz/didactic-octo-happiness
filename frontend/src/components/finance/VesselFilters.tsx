import { Button, Segmented, Space, Tooltip } from "antd";
import { DownloadOutlined, ReloadOutlined } from "@ant-design/icons";
import type { Dayjs } from "dayjs";
import { MonthRangeFilter } from "../MonthRangeFilter";
import type { Currency } from "../../types/finance";

interface Props {
  monthValue: [Dayjs, Dayjs];
  currency: Currency;
  onMonthChange: (v: [Dayjs | null, Dayjs | null] | null) => void;
  onCurrencyChange: (v: Currency) => void;
  /** Placeholder — the Excel export is not wired up yet. */
  onExport: () => void;
  onRefresh: () => void;
}

// Vessel Profitability header filter row: a Month Range picker, an INR↔USD
// currency toggle, a (placeholder) download button and a refetch button.
// Presentational — all state is owned by the page.
export const VesselFilters = ({
  monthValue,
  currency,
  onMonthChange,
  onCurrencyChange,
  onExport,
  onRefresh,
}: Props) => (
  <Space size="middle" align="end" wrap>
    <MonthRangeFilter value={monthValue} onChange={onMonthChange} />
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
    <Tooltip title="Refresh">
      <Button icon={<ReloadOutlined />} onClick={onRefresh} aria-label="Refresh" />
    </Tooltip>
  </Space>
);
