import { Alert, Card, Segmented, Skeleton, Table, Tooltip } from "antd";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Dayjs } from "dayjs";
import type { ColumnsType } from "antd/es/table";
import { PageHeader } from "../../components/PageHeader";
import { Chart } from "../../components/Chart";
import { DateRangeFilter } from "../../components/DateRangeFilter";
import { PortFilter } from "../../components/filters/PortFilter";
import { SegmentFilter } from "../../components/filters/SegmentFilter";
import { financeApi } from "../../api/finance";
import { formatDateRangeParam } from "../../utils/dateRangeParam";
import { formatAccounting } from "../../utils/format";
import { brand } from "../../theme/tokens";
import { useBrandTokens } from "../../theme/useBrandTokens";
import type { ProfitabilityBar, VesselRow } from "../../types/finance";

type RangeValue = [Dayjs | null, Dayjs | null] | null;
type Mode = "port" | "segment";

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
    column: { dataLabels: { enabled: true, format: "{y}" }, groupPadding: 0.1 },
  },
  series: [
    {
      type: "column",
      name: mode === "port" ? "Port" : "Segment",
      data: data.map((d) => d.value),
      color: brand.purpleDark,
    },
  ],
});

export const Profitability = () => {
  const t = useBrandTokens();
  const [mode, setMode] = useState<Mode>("port");
  const [port, setPort] = useState<string | undefined>(undefined);
  const [segment, setSegment] = useState<string | undefined>(undefined);
  const [range, setRange] = useState<RangeValue>(null);
  const dateRange = formatDateRangeParam(range);

  const filter = mode === "port" ? port : segment;
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["profitability", mode, filter, dateRange],
    queryFn: () => financeApi.profitability({ mode, port, segment, dateRange }),
  });

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
        <Alert
          type="error"
          showIcon
          message="Could not load profitability"
          description={error instanceof Error ? error.message : "Unknown error"}
          action={<a onClick={() => refetch()} style={{ cursor: "pointer" }}>Retry</a>}
        />
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
