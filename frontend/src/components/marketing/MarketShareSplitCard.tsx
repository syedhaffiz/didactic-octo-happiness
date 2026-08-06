import { useMemo, type ReactNode } from "react";
import { Card, Empty } from "antd";
import type Highcharts from "highcharts";
import { Chart } from "../Chart";
import { CardTitle } from "../CardTitle";
import { ErrorBoundary } from "../ErrorBoundary";
import { ErrorRetry } from "../ErrorRetry";
import { useApi } from "../../api/useApi";
import { useBrandTokens } from "../../theme/useBrandTokens";
import { marketingColors, marketShareSeriesLabels } from "../../theme/tokens";
import type { MarketShareSplitResponse } from "../../types/marketing";

const COLORS = marketingColors.marketShare.split;

interface Props {
  title: string;
  icon?: ReactNode;
  queryKey: ReadonlyArray<unknown>;
  fetcher: () => Promise<MarketShareSplitResponse>;
  height?: number;
}

const pct = (v: number, total: number) => (total > 0 ? (v / total) * 100 : 0);
const fmt2 = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// Card 1 — own vs non-own market-share donut with the MMT total in the centre
// and a share line per party below.
export const MarketShareSplitCard = ({ title, icon, queryKey, fetcher, height = 260 }: Props) => {
  const t = useBrandTokens();
  const { data, isLoading, isError, error, refetch } = useApi(queryKey, fetcher);

  const own = data?.own ?? 0;
  const nonOwn = data?.nonOwn ?? 0;
  const total = data?.total ?? 0;
  const unit = data?.unit ?? "MMT";
  const hasData = total > 0;

  const options = useMemo<Highcharts.Options>(
    () => ({
      chart: { type: "pie", height },
      tooltip: {
        useHTML: true,
        formatter(this: Highcharts.Point): string {
          return `<b>${this.name}</b><br/>${fmt2(Number(this.y))} ${unit} (${pct(Number(this.y), total).toFixed(2)}%)`;
        },
      },
      plotOptions: {
        pie: { innerSize: "68%", borderWidth: 0, dataLabels: { enabled: false }, showInLegend: true },
      },
      legend: { enabled: true, align: "center", verticalAlign: "bottom", symbolRadius: 6 },
      series: [
        {
          type: "pie",
          name: "Market Share",
          data: [
            { name: marketShareSeriesLabels.nonOwn, y: nonOwn, color: COLORS.nonOwn },
            { name: marketShareSeriesLabels.own, y: own, color: COLORS.own },
          ],
        },
      ],
    }),
    [own, nonOwn, total, unit, height],
  );

  const shareLine = (label: string, value: number, color: string) => (
    <div>
      <div style={{ fontSize: 12, color: t.textSecondary }}>{label} Share</div>
      <div style={{ fontWeight: 700, color }}>
        {fmt2(value)} {unit}{" "}
        <span style={{ color: t.textSecondary, fontWeight: 500 }}>({pct(value, total).toFixed(2)}%)</span>
      </div>
    </div>
  );

  // Reserve the donut + share-line height so every state keeps the same size.
  const contentMinHeight = height + 64;

  return (
    <Card
      title={<CardTitle icon={icon}>{title}</CardTitle>}
      style={{ height: "100%" }}
      styles={{ header: { borderBottom: "none" }, body: { paddingTop: 0 } }}
    >
      <div
        style={{
          minHeight: contentMinHeight,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        {isError ? (
          <ErrorRetry title={`Could not load ${title}`} error={error} onRetry={refetch} />
        ) : !hasData && !isLoading ? (
          <Empty description="No data" style={{ padding: 32 }} />
        ) : (
          <ErrorBoundary level="section" label={title}>
          <div style={{ position: "relative" }}>
            <Chart loading={isLoading} options={options} />
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: height - 56,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                pointerEvents: "none",
              }}
            >
              <span style={{ fontSize: 22, fontWeight: 700, color: t.text }}>{fmt2(total)}</span>
              <span style={{ fontSize: 11, color: t.textSecondary }}>{unit} TOTAL</span>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-around", marginTop: 12 }}>
            {shareLine(marketShareSeriesLabels.nonOwn, nonOwn, COLORS.nonOwn)}
            {shareLine(marketShareSeriesLabels.own, own, COLORS.own)}
          </div>
        </ErrorBoundary>
        )}
      </div>
    </Card>
  );
};
