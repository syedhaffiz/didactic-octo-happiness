import { Card, Segmented, Skeleton, Table, Tooltip } from "antd";
import { ErrorRetry } from "../../components/ErrorRetry";
import type { ColumnsType } from "antd/es/table";
import { PageHeader } from "../../components/PageHeader";
import { Chart } from "../../components/Chart";
import { DateRangeFilter } from "../../components/DateRangeFilter";
import { PortFilter } from "../../components/filters/PortFilter";
import { SegmentFilter } from "../../components/filters/SegmentFilter";
import { financeApi } from "../../api/finance";
import { useApi } from "../../api/useApi";
import { useUrlDateRange, useUrlParam } from "../../utils/useUrlParam";
import { formatAccounting } from "../../utils/format";
import { profitColumn } from "../../theme/tokens";
import { useBrandTokens } from "../../theme/useBrandTokens";
import type { ProfitabilityBar, VesselRow } from "../../types/finance";

type Mode = "port" | "segment";
const isMode = (v: string | undefined): v is Mode => v === "port" || v === "segment";

const chartOptions = (data: ProfitabilityBar[], mode: Mode): Highcharts.Options => ({
  chart: { type: "column", height: 320 },
  xAxis: { categories: data.map((d) => d.category) },
  yAxis: {
    min: 0,
    title: { text: undefined },
  },
  legend: { enabled: false },
  tooltip: { valueDecimals: 0 },
  plotOptions: {
    column: {
      dataLabels: { enabled: true, format: "{y}", style: { fontWeight: "600" } },
      groupPadding: 0.08,
      pointWidth: 30,
    },
  },
  series: [
    {
      type: "column",
      name: mode === "port" ? "Port" : "Segment",
      data: data.map((d) => d.value),
      color: profitColumn,
    },
  ],
});

export const Profitability = () => {
  const t = useBrandTokens();
  const [rawMode, setRawMode] = useUrlParam("mode");
  const mode: Mode = isMode(rawMode) ? rawMode : "port";
  const setMode = (next: Mode) => setRawMode(next === "port" ? undefined : next);
  const [port, setPort] = useUrlParam("port");
  const [segment, setSegment] = useUrlParam("segment");
  const [range, setRange, dateRange] = useUrlDateRange();

  const filter = mode === "port" ? port : segment;
  const { data, isLoading, isError, error, refetch } = useApi(
    ["profitability", mode, filter, dateRange],
    () => financeApi.profitability({ mode, port, segment, dateRange }),
  );

  const vesselColumns: ColumnsType<VesselRow> = [
    { title: "Batch ID", dataIndex: "batchId", key: "batchId", width: 140 },
    { title: "Vessel", dataIndex: "vessel", key: "vessel" },
    { title: "Grade", dataIndex: "grade", key: "grade", width: 140 },
    { title: "Origin", dataIndex: "origin", key: "origin", width: 90 },
    { title: "Port", dataIndex: "port", key: "port", width: 130 },
    { title: "Segment", dataIndex: "segment", key: "segment", width: 130 },
    {
      title: "Profit",
      dataIndex: "profit",
      key: "profit",
      align: "right",
      width: 160,
      render: (v: number) => (
        <Tooltip title={v.toLocaleString("en-IN", { maximumFractionDigits: 2 })}>
          <span style={{ color: v < 0 ? t.deltaDown : t.text }}>{formatAccounting(v)}</span>
        </Tooltip>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Gross Margin Profitability"
        filters={
          <>
            {mode === "port" ? (
              <PortFilter value={port} onChange={setPort} />
            ) : (
              <SegmentFilter value={segment} onChange={setSegment} />
            )}
            <DateRangeFilter value={range} onChange={setRange} />
          </>
        }
      />

      <Segmented
        value={mode}
        onChange={(v) => setMode(v as Mode)}
        options={[
          { value: "port", label: "Port wise" },
          { value: "segment", label: "Segment wise" },
        ]}
        style={{ marginBottom: 16 }}
      />

      {isError ? (
        <ErrorRetry title="Could not load profitability" error={error} onRetry={refetch} />
      ) : (
        <>
          <Card title={mode === "port" ? "Port Wise Analysis" : "Segment Wise Analysis"} style={{ marginBottom: 16 }}>
            {isLoading || !data ? (
              <Skeleton active paragraph={{ rows: 6 }} />
            ) : (
              <Chart options={chartOptions(data.chart, mode)} />
            )}
          </Card>
          <Card>
            {isLoading || !data ? (
              <Skeleton active paragraph={{ rows: 8 }} />
            ) : (
              <Table
                rowKey={(r, i) => `${r.batchId}-${i}`}
                columns={vesselColumns}
                dataSource={data.vessels}
                pagination={{ pageSize: 10, showSizeChanger: false }}
                size="middle"
              />
            )}
          </Card>
        </>
      )}
    </>
  );
};
