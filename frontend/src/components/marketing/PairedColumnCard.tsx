import { useMemo, type ReactNode } from "react";
import { Card, Empty } from "antd";
import type Highcharts from "highcharts";
import { Chart } from "../Chart";
import { CardTitle } from "../CardTitle";
import { ErrorBoundary } from "../ErrorBoundary";
import { ErrorRetry } from "../ErrorRetry";
import { useApi } from "../../api/useApi";
import { marketShareSeriesLabels } from "../../theme/tokens";
import { fmtK } from "../../utils/format";
import type { MarketSharePairedResponse } from "../../types/marketing";

export interface ColorPair {
  own: string; // own party
  nonOwn: string; // competitors
}

interface Props {
  title: string;
  icon?: ReactNode;
  /** useApi dependency key — include the shared filter params so it refetches. */
  queryKey: ReadonlyArray<unknown>;
  fetcher: () => Promise<MarketSharePairedResponse>;
  colorPair: ColorPair;
  height?: number;
  /** X-axis label rotation; 0 by default, -45 for long lists (Port Wise). */
  labelRotation?: number;
  /** Per-bar value labels. Off for dense charts (Port Wise) where they crowd. */
  showDataLabels?: boolean;
}

// Reusable, self-fetching grouped column chart: one own + one non-own column
// per category (brand labels applied via marketShareSeriesLabels). Powers
// Import Quantity, Market Share by Category,
// Industry Wise, Origin Wise and Port Wise — each wired to its own endpoint.
export const PairedColumnCard = ({
  title,
  icon,
  queryKey,
  fetcher,
  colorPair,
  height = 340,
  labelRotation = 0,
  showDataLabels = true,
}: Props) => {
  const { data, isLoading, isError, error, refetch } = useApi(queryKey, fetcher);
  const rows = useMemo(() => data?.rows ?? [], [data]);
  const unit = data?.unit ?? "";

  const options = useMemo<Highcharts.Options>(
    () => ({
      chart: { type: "column", height },
      xAxis: {
        categories: rows.map((r) => r.category),
        labels: { rotation: labelRotation, style: { fontSize: "10px" } },
      },
      yAxis: {
        min: 0,
        title: { text: unit, style: { fontSize: "11px" } },
        labels: { formatter(): string { return fmtK(this.value); } },
      },
      legend: { enabled: true, align: "center", verticalAlign: "bottom", symbolRadius: 6 },
      tooltip: { shared: true, valueSuffix: ` ${unit}`, valueDecimals: 0 },
      plotOptions: {
        column: {
          groupPadding: 0.12,
          pointPadding: 0.05,
          borderRadius: 2,
          dataLabels: {
            enabled: showDataLabels,
            formatter(): string { return fmtK(this.y); },
            style: { fontSize: "9px", textOutline: "none" },
          },
        },
      },
      series: [
        {
          type: "column",
          name: marketShareSeriesLabels.own,
          data: rows.map((r) => r.own),
          color: colorPair.own,
        },
        {
          type: "column",
          name: marketShareSeriesLabels.nonOwn,
          data: rows.map((r) => r.nonOwn),
          color: colorPair.nonOwn,
        },
      ],
    }),
    [rows, unit, colorPair, height, labelRotation, showDataLabels],
  );

  return (
    <Card
      title={<CardTitle icon={icon}>{title}</CardTitle>}
      style={{ height: "100%" }}
      styles={{ header: { borderBottom: "none" }, body: { paddingTop: 0 } }}
    >
      {/* Reserve the chart's height in every state so loading / error / empty
          don't shrink the card and jump when data arrives. */}
      <div
        style={{
          minHeight: height,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        {isError ? (
          <ErrorRetry title={`Could not load ${title}`} error={error} onRetry={refetch} />
        ) : rows.length === 0 && !isLoading ? (
          <Empty description="No data" style={{ padding: 32 }} />
        ) : (
          <ErrorBoundary level="section" label={title}>
            <Chart loading={isLoading} options={options} />
          </ErrorBoundary>
        )}
      </div>
    </Card>
  );
};
