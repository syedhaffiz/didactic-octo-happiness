import { Button, Select, Space, Tooltip } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import type { Dayjs } from "dayjs";
import { FilterField } from "../filters/FilterField";
import { DateRangeFilter } from "../DateRangeFilter";
import type { ContractFilterOption, ContractsFilterOptions } from "../../types/commercialOps";

const ALL = "__all__";

interface Props {
  /** When false only the Date Range picker shows (the Contract Details header). */
  showDimensions?: boolean;
  /** Zone / port / segment options from the Contracts filters API. */
  options?: ContractsFilterOptions;
  optionsLoading?: boolean;
  zone?: string;
  port?: string;
  segment?: string;
  dateValue: [Dayjs, Dayjs] | null;
  onZoneChange?: (v: string | undefined) => void;
  onPortChange?: (v: string | undefined) => void;
  onSegmentChange?: (v: string | undefined) => void;
  onDateChange: (v: [Dayjs | null, Dayjs | null] | null) => void;
  /** Omit to hide the download button (e.g. Plot Rent). */
  onExport?: () => void;
  exportDisabled?: boolean;
}

const toSelectOptions = (items: ContractFilterOption[] | undefined) => [
  { value: ALL, label: "All" },
  ...(Array.isArray(items) ? items : [])
    .filter((o) => o && typeof o.id === "string")
    .map((o) => ({ value: o.id, label: o.name ?? o.id })),
];

// One "label above a single-select" dropdown with an "All" entry. The stored
// value is the option id (undefined = All).
const DimensionSelect = ({
  label,
  items,
  value,
  loading,
  onChange,
}: {
  label: string;
  items: ContractFilterOption[] | undefined;
  value: string | undefined;
  loading: boolean;
  onChange: (v: string | undefined) => void;
}) => (
  <FilterField label={label} width={160}>
    <Select
      value={value ?? ALL}
      onChange={(v) => onChange(v === ALL ? undefined : v)}
      options={toSelectOptions(items)}
      loading={loading}
      showSearch
      optionFilterProp="label"
      style={{ width: "100%" }}
    />
  </FilterField>
);

// Contracts header filter row: Zone / Port / Segment / Date Range plus the
// download button. The three dropdowns are independent single selects fed by
// one filters payload. Presentational — the page owns the state.
export const ContractsFilters = ({
  showDimensions = true,
  options,
  optionsLoading = false,
  zone,
  port,
  segment,
  dateValue,
  onZoneChange,
  onPortChange,
  onSegmentChange,
  onDateChange,
  onExport,
  exportDisabled = false,
}: Props) => {
  return (
    <Space size="middle" align="end" wrap>
      {showDimensions && onZoneChange ? (
        <DimensionSelect
          label="Zone"
          items={options?.zones}
          value={zone}
          loading={optionsLoading}
          onChange={onZoneChange}
        />
      ) : null}
      {showDimensions && onPortChange ? (
        <DimensionSelect
          label="Port"
          items={options?.ports}
          value={port}
          loading={optionsLoading}
          onChange={onPortChange}
        />
      ) : null}
      {showDimensions && onSegmentChange ? (
        <DimensionSelect
          label="Segment"
          items={options?.segments}
          value={segment}
          loading={optionsLoading}
          onChange={onSegmentChange}
        />
      ) : null}
      <DateRangeFilter value={dateValue} onChange={onDateChange} />
      {onExport ? (
        <Tooltip title="Download">
          <Button
            icon={<DownloadOutlined />}
            onClick={onExport}
            disabled={exportDisabled}
            aria-label="Download"
          />
        </Tooltip>
      ) : null}
    </Space>
  );
};
