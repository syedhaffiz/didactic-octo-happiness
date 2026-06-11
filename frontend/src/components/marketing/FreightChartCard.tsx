import { Card, Empty, Skeleton } from "antd";
import { ErrorBoundary } from "../ErrorBoundary";
import { MultiSeriesLineChart } from "../MultiSeriesLineChart";
import { marketingColors } from "../../theme/tokens";
import type { FreightChart } from "../../types/marketing";

// A single vessel-type card (Capes / Panamax) wrapping the line chart.
export const FreightChartCard = ({
  title,
  chart,
  loading,
}: {
  title: string;
  chart?: FreightChart;
  loading: boolean;
}) => (
  <Card title={title}>
    {loading || !chart ? (
      <Skeleton active paragraph={{ rows: 6 }} />
    ) : (chart.series ?? []).length === 0 ? (
      <Empty />
    ) : (
      <ErrorBoundary level="section" label={title}>
        <MultiSeriesLineChart
          categories={chart.categories ?? []}
          series={chart.series ?? []}
          colors={marketingColors.lineSeries}
          height={340}
          yTitle={chart.unit}
          valueDecimals={2}
          dataLabels
        />
      </ErrorBoundary>
    )}
  </Card>
);
