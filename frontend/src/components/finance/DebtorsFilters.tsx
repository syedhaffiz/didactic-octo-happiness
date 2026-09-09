import { Badge, Button, DatePicker, Segmented, Space, Tooltip } from "antd";
import { FilterOutlined, ReloadOutlined, UploadOutlined } from "@ant-design/icons";
import type { Dayjs } from "dayjs";
import type { ReactNode } from "react";
import { FilterField } from "../filters/FilterField";
import type { Currency } from "../../types/finance";

interface Props {
  tillDate: Dayjs | null;
  currency: Currency;
  drawerActiveCount: number;
  onTillDateChange: (date: Dayjs | null) => void;
  onCurrencyChange: (currency: Currency) => void;
  onOpenFilters: () => void;
  /** Placeholder — the Excel export is not wired up yet. */
  onExport: () => void;
  onRefresh: () => void;
  /** Extra control rendered at the end of the row (e.g. the column picker). */
  columnPicker?: ReactNode;
}

// Debtors header control row: an as-of "Till date" picker, an INR↔USD currency
// toggle, the badged button that opens the Filters side-panel, and (placeholder)
// export + refresh actions. Presentational — all state is owned by the page.
export const DebtorsFilters = ({
  tillDate,
  currency,
  drawerActiveCount,
  onTillDateChange,
  onCurrencyChange,
  onOpenFilters,
  onExport,
  onRefresh,
  columnPicker,
}: Props) => (
  <Space size="middle" align="end" wrap>
    <FilterField label="Date" width={200}>
      <DatePicker
        value={tillDate}
        onChange={onTillDateChange}
        placeholder="Till date"
        format="DD MMM YY"
        style={{ width: "100%" }}
      />
    </FilterField>
    <Segmented<Currency>
      value={currency}
      onChange={onCurrencyChange}
      options={[
        { label: "INR", value: "INR" },
        { label: "USD", value: "USD" },
      ]}
    />
    <Badge count={drawerActiveCount} size="small">
      <Button type="primary" icon={<FilterOutlined />} onClick={onOpenFilters}>
        Filters
      </Button>
    </Badge>
    <Tooltip title="Export to Excel">
      <Button icon={<UploadOutlined />} onClick={onExport} aria-label="Export to Excel" />
    </Tooltip>
    <Tooltip title="Refresh">
      <Button icon={<ReloadOutlined />} onClick={onRefresh} aria-label="Refresh" />
    </Tooltip>
    {columnPicker}
  </Space>
);
