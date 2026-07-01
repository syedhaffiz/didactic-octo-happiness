import type { ReactNode } from "react";
import { Card, Empty } from "antd";
import { Chart } from "../Chart";
import { CardTitle } from "../CardTitle";
import { approvedBudgetSeries } from "../../theme/tokens";
import type { BudgetSeries } from "../../types/finance";

interface Props {
  title: string;
  icon: ReactNode;
  series?: BudgetSeries;
  loading: boolean;
}

// Single "Budget" trend line. Reused for both Volume (MT) and Margin (Cr) — the
// y-axis unit comes from the series. Tolerates undefined/empty input so it can
// render empty under the loading overlay before data resolves.
const trendOptions = (s?: BudgetSeries): Highcharts.Options => {
  const yTitle = s?.unit === "Cr" ? "Cr (INR)" : s?.unit ?? "";
  return {
    chart: { type: "line", height: 280 },
    xAxis: { categories: s?.months ?? [] },
    yAxis: { title: { text: yTitle, style: { fontSize: "11px" } } },
    legend: { enabled: true, align: "center", verticalAlign: "bottom" },
    tooltip: { shared: true, valueDecimals: 1 },
    plotOptions: {
      line: {
        marker: { enabled: true, radius: 3 },
        dataLabels: { enabled: true, style: { fontSize: "10px", fontWeight: "500" } },
      },
    },
    series: [
      {
        type: "line",
        name: "Budget",
        data: s?.budget ?? [],
        color: approvedBudgetSeries.budget,
        marker: { fillColor: approvedBudgetSeries.budget },
      },
    ],
  };
};

export const BudgetTrendCard = ({ title, icon, series, loading }: Props) => {
  const empty = !loading && (series?.budget?.length ?? 0) === 0;
  return (
    <Card title={<CardTitle icon={icon}>{title}</CardTitle>}>
      {empty ? (
        <Empty description={`No ${title.toLowerCase()} data`} />
      ) : (
        <Chart loading={loading} options={trendOptions(series)} />
      )}
    </Card>
  );
};
