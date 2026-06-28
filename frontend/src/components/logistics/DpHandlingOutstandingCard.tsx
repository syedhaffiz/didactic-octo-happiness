import { Card, Empty, Skeleton } from "antd";
import type Highcharts from "highcharts";
import { Chart } from "../Chart";
import { ErrorBoundary } from "../ErrorBoundary";
import { logisticsColors } from "../../theme/tokens";
import type { DpHandlingOutstanding } from "../../types/logistics";

// Series colors — purple (first agent) / blue (second), matching the design.
const SERIES_COLORS = logisticsColors.outstandingSeries;

// Compact "millions" label for the columns, e.g. 98_440_000 -> "98.44M".
const fmtMillions = (v: number | null | undefined): string =>
  v == null ? "" : `${(v / 1_000_000).toFixed(2)}M`;

const buildOptions = (data: DpHandlingOutstanding): Highcharts.Options => ({
  chart: { type: "column", height: 360 },
  xAxis: { categories: data.categories },
  yAxis: {
    min: 0,
    title: { text: `Outstanding Amount (${data.unit})`, style: { fontSize: "11px" } },
    labels: {
      formatter() {
        return Number(this.value).toLocaleString();
      },
    },
  },
  legend: { enabled: true, align: "center", verticalAlign: "bottom" },
  tooltip: {
    formatter() {
      return `<b>${this.series.name}</b><br/>${this.x}: ${Number(this.y).toLocaleString()}`;
    },
  },
  plotOptions: {
    column: {
      groupPadding: 0.18,
      pointPadding: 0.06,
      dataLabels: {
        enabled: true,
        formatter() {
          return fmtMillions(this.y);
        },
      },
    },
  },
  series: data.series.map((s, i) => ({
    type: "column",
    name: s.agent,
    data: s.data,
    color: SERIES_COLORS[i % SERIES_COLORS.length],
  })),
});

export const DpHandlingOutstandingCard = ({
  data,
  loading,
}: {
  data?: DpHandlingOutstanding;
  loading: boolean;
}) => (
  <Card title="DP Handling Agents - Outstanding Payments">
    {loading || !data ? (
      <Skeleton active paragraph={{ rows: 8 }} />
    ) : (data.series ?? []).length === 0 ? (
      <Empty description="No outstanding payments" />
    ) : (
      <ErrorBoundary level="section" label="DP Handling Agents outstanding payments">
        <Chart options={buildOptions(data)} />
      </ErrorBoundary>
    )}
  </Card>
);
