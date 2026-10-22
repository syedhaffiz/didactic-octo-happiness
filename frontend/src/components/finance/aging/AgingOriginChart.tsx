import { useMemo } from "react";
import { Empty, Skeleton } from "antd";
import type Highcharts from "highcharts";
import { Chart } from "../../Chart";
import { agingColors } from "../../../theme/tokens";
import type { AgingResponse } from "../../../types/finance";
import { formatAgingCompact, formatAgingFull, isAgingEmpty } from "./agingFormat";

interface Props {
  data?: AgingResponse;
  loading: boolean;
}

// Origin Wise chart — grouped columns, one series per origin within each age
// bucket. Series colors are assigned by response position from the shared
// palette (cycling if exceeded). Volume ticks carry the "MT" suffix per the
// Figma; value ticks read in Cr / L.
const buildOptions = (data: AgingResponse): Highcharts.Options => {
  const { unit } = data;
  const tick = (v: number) => {
    const compact = formatAgingCompact(v, unit);
    return unit === "MT" && v !== 0 ? `${compact} MT` : compact;
  };
  return {
    chart: { type: "column", height: 420 },
    xAxis: { categories: data.buckets.map((b) => b.bucket) },
    yAxis: {
      min: 0,
      labels: {
        formatter(): string {
          return tick(Number(this.value));
        },
      },
    },
    legend: { enabled: true, align: "center", verticalAlign: "bottom", symbolRadius: 6 },
    tooltip: {
      shared: true,
      pointFormatter(this: Highcharts.Point): string {
        return `<span style="color:${String(this.color)}">●</span> ${this.series.name}: <b>${formatAgingFull(this.y ?? 0, unit)}</b><br/>`;
      },
    },
    plotOptions: {
      column: { groupPadding: 0.18, pointPadding: 0.08, maxPointWidth: 20, borderRadius: 2 },
    },
    series: data.originwise.map((o, i) => ({
      type: "column" as const,
      name: o.origin,
      data: o.amounts,
      color: agingColors.origins[i % agingColors.origins.length],
    })),
  };
};

export const AgingOriginChart = ({ data, loading }: Props) => {
  const options = useMemo(() => (data ? buildOptions(data) : undefined), [data]);

  if (!data || !options) return <Skeleton active paragraph={{ rows: 8 }} />;
  if (isAgingEmpty(data)) return <Empty description="No origin data for these filters" />;

  return <Chart loading={loading} options={options} />;
};
