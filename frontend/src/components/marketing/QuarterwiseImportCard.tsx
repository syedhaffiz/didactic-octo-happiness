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
import { fmtK } from "../../utils/format";
import type { MarketShareQuarterwiseResponse } from "../../types/marketing";

const COLORS = marketingColors.marketShare.quarterwise;

interface Props {
  title: string;
  icon?: ReactNode;
  queryKey: ReadonlyArray<unknown>;
  fetcher: () => Promise<MarketShareQuarterwiseResponse>;
  height?: number;
}

// Card 4 — Quarterwise Import. Each quarter (QTR-1..4) holds one own / non-own
// column pair per fiscal year. Quarters are separated with alternating plot
// bands labelled at the top of each group.
export const QuarterwiseImportCard = ({ title, icon, queryKey, fetcher, height = 420 }: Props) => {
  const t = useBrandTokens();
  const { data, isLoading, isError, error, refetch } = useApi(queryKey, fetcher);
  const groups = useMemo(() => data?.groups ?? [], [data]);
  const unit = data?.unit ?? "";

  const options = useMemo<Highcharts.Options>(() => {
    const perGroup = groups[0]?.rows.length ?? 0;
    const flat = groups.flatMap((g) => g.rows);
    const plotBands: Highcharts.XAxisPlotBandsOptions[] = groups.map((g, gi) => ({
      from: gi * perGroup - 0.5,
      to: gi * perGroup + perGroup - 0.5,
      color: gi % 2 === 1 ? t.accentBg : "transparent",
      label: {
        text: g.quarter,
        align: "center",
        style: { color: t.textSecondary, fontWeight: "bold", fontSize: "11px" },
      },
    }));

    return {
      chart: { type: "column", height },
      xAxis: {
        categories: flat.map((r) => r.category),
        plotBands,
        labels: { rotation: -45, style: { fontSize: "9px" } },
      },
      yAxis: {
        min: 0,
        title: { text: unit, style: { fontSize: "11px" } },
        labels: { formatter(): string { return fmtK(this.value); } },
      },
      legend: { enabled: true, align: "center", verticalAlign: "bottom", symbolRadius: 6 },
      tooltip: { shared: true, valueSuffix: ` ${unit}`, valueDecimals: 0 },
      plotOptions: { column: { groupPadding: 0.1, pointPadding: 0.05, borderRadius: 2 } },
      series: [
        {
          type: "column",
          name: marketShareSeriesLabels.own,
          data: flat.map((r) => r.own),
          color: COLORS.own,
        },
        {
          type: "column",
          name: marketShareSeriesLabels.nonOwn,
          data: flat.map((r) => r.nonOwn),
          color: COLORS.nonOwn,
        },
      ],
    };
  }, [groups, unit, height, t.accentBg, t.textSecondary]);

  const hasData = groups.length > 0;

  return (
    <Card
      title={<CardTitle icon={icon}>{title}</CardTitle>}
      style={{ height: "100%" }}
      styles={{ header: { borderBottom: "none" }, body: { paddingTop: 0 } }}
    >
      {/* Reserve the chart's height in every state to avoid layout jumps. */}
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
        ) : !hasData && !isLoading ? (
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
