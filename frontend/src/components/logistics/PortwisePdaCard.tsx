import { useMemo } from "react";
import { Card, Empty, Select, Skeleton, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { AimOutlined } from "@ant-design/icons";
import { brand } from "../../theme/tokens";
import { useBrandTokens } from "../../theme/useBrandTokens";
import { ErrorRetry } from "../ErrorRetry";
import { logisticsApi } from "../../api/logistics";
import { useApi } from "../../api/useApi";
import { useUrlParam } from "../../utils/useUrlParam";
import type { PdaRow } from "../../types/logistics";

// Two-decimal, no grouping — matches the design's figures (e.g. "90000.00").
const fmt2 = (n: number) => n.toFixed(2);

// Column header with a smaller, muted unit suffix (e.g. "Qty (in MT)").
const unitHeader = (label: string, unit: string) => (
  <span>
    {label} <span style={{ fontWeight: 400, color: brand.textMuted }}>({unit})</span>
  </span>
);

interface Props {
  title: string;
}

// Portwise PDA (Port Disbursement Account): a per-port / per-vessel-type table
// of quantity handled and the per-metric-tonne cost with GST, in USD and INR.
// The header dropdown selects a fiscal-year half; the chosen period drives the
// query and is mirrored to the URL so the view is shareable.
export const PortwisePdaCard = ({ title }: Props) => {
  const t = useBrandTokens();

  // Period list drives the header dropdown; the first entry is the default.
  const periods = useApi(["logistics", "pda-periods"], () => logisticsApi.pdaPeriods());
  const [period, setPeriod] = useUrlParam("pdaPeriod");
  const defaultPeriod = periods.data?.period[0]?.period;
  const activePeriod = period ?? defaultPeriod;

  // Rows depend on the selected period. Wait for a period to resolve before
  // firing (unless the period list failed, in which case fall back to the API's
  // own default period so the table still loads).
  const { data, isLoading, isError, error, refetch } = useApi(
    ["logistics", "pda", activePeriod, periods.isError],
    () =>
      activePeriod
        ? logisticsApi.pda(activePeriod)
        : periods.isError
          ? logisticsApi.pda(undefined)
          : new Promise<never>(() => {}),
  );
  const rows = data?.items;

  const columns: ColumnsType<PdaRow> = useMemo(
    () => [
      {
        title: "Ports",
        dataIndex: "port",
        key: "port",
        sorter: (a, b) => a.port.localeCompare(b.port),
        render: (v: string) => <span style={{ color: t.linkBlue, fontWeight: 500 }}>{v}</span>,
      },
      {
        title: "Vessel Type",
        dataIndex: "vesselType",
        key: "vesselType",
        sorter: (a, b) => a.vesselType.localeCompare(b.vesselType),
        render: (v: string) => <span style={{ color: t.linkBlue, fontWeight: 500 }}>{v}</span>,
      },
      {
        title: unitHeader("Qty", "in MT"),
        dataIndex: "qty",
        key: "qty",
        align: "right",
        sorter: (a, b) => a.qty - b.qty,
        render: (v: number) => <span style={{ color: t.linkBlue, fontWeight: 600 }}>{fmt2(v)}</span>,
      },
      {
        title: "Total with GST",
        dataIndex: "totalWithGst",
        key: "totalWithGst",
        align: "right",
        sorter: (a, b) => a.totalWithGst - b.totalWithGst,
        render: fmt2,
      },
      {
        title: unitHeader("PMT", "IN USD"),
        dataIndex: "pmtUsd",
        key: "pmtUsd",
        align: "right",
        sorter: (a, b) => a.pmtUsd - b.pmtUsd,
        render: fmt2,
      },
      {
        title: unitHeader("PMT", "IN INR"),
        dataIndex: "pmtInr",
        key: "pmtInr",
        align: "right",
        sorter: (a, b) => a.pmtInr - b.pmtInr,
        render: fmt2,
      },
    ],
    [t.linkBlue],
  );

  const cardTitle = (
    <span>
      <AimOutlined style={{ color: t.accentText, marginRight: 8 }} />
      {title}
    </span>
  );

  const periodSelect = (
    <Select
      size="small"
      value={activePeriod}
      onChange={(v) => setPeriod(v === defaultPeriod ? undefined : v)}
      options={(periods.data?.period ?? []).map((p) => ({
        value: p.period,
        label: p.periodDisplay,
      }))}
      loading={periods.isLoading}
      placeholder="Period"
      style={{ width: 150 }}
    />
  );

  return (
    <Card title={cardTitle} extra={periodSelect} style={{ height: "100%" }}>
      {isError ? (
        <ErrorRetry title="Could not load Portwise PDA" error={error} onRetry={refetch} />
      ) : isLoading || !rows ? (
        <Skeleton active paragraph={{ rows: 8 }} />
      ) : rows.length === 0 ? (
        <Empty description="No PDA data" />
      ) : (
        <Table<PdaRow>
          rowKey="id"
          columns={columns}
          dataSource={rows}
          pagination={false}
          size="middle"
          scroll={{ x: "max-content" }}
        />
      )}
    </Card>
  );
};
