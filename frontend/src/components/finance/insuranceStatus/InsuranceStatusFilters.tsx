import { Button, Select, Space, Tooltip } from "antd";
import { ReloadOutlined, UploadOutlined } from "@ant-design/icons";
import { ZoneFilter } from "../../filters/ZoneFilter";
import { PortFilter } from "../../filters/PortFilter";
import { FilterField } from "../../filters/FilterField";

const ALL = "__all__";

interface Props {
  zone: string | undefined;
  port: string | undefined;
  policyType: string | undefined;
  /** Policy-type dropdown options (from the insurance filter-options endpoint). */
  policyTypes: string[];
  onZoneChange: (v: string | undefined) => void;
  onPortChange: (v: string | undefined) => void;
  onPolicyTypeChange: (v: string | undefined) => void;
  /** Placeholder — the Excel export is not wired up yet. */
  onExport: () => void;
  onRefresh: () => void;
}

// Insurance Status header filter row: Zone / Port / Policy Type
// plus (placeholder) Excel export and refresh actions. Presentational — all
// state is owned by the page.
export const InsuranceStatusFilters = ({
  zone,
  port,
  policyType,
  policyTypes,
  onZoneChange,
  onPortChange,
  onPolicyTypeChange,
  onExport,
  onRefresh,
}: Props) => (
  <Space size="middle" align="end" wrap>
    <ZoneFilter value={zone} onChange={onZoneChange} />
    <PortFilter value={port} onChange={onPortChange} />
    <FilterField label="Policy Type" width={200}>
      <Select
        value={policyType ?? ALL}
        onChange={(v) => onPolicyTypeChange(v === ALL ? undefined : v)}
        options={[
          { value: ALL, label: "All" },
          ...policyTypes.map((p) => ({ value: p, label: p })),
        ]}
        style={{ width: "100%" }}
      />
    </FilterField>
    <Tooltip title="Export to Excel">
      <Button icon={<UploadOutlined />} onClick={onExport} aria-label="Export to Excel" />
    </Tooltip>
    <Tooltip title="Refresh">
      <Button icon={<ReloadOutlined />} onClick={onRefresh} aria-label="Refresh" />
    </Tooltip>
  </Space>
);
