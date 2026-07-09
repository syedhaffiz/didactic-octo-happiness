import { useMemo } from "react";
import { Empty } from "antd";
import type Highcharts from "highcharts";
import { Chart } from "../Chart";
import { chartSeries } from "../../theme/tokens";
import { fmtK } from "../../utils/format";

export interface BudgetActualRow {
  category: string;
  budget: number;
  actual: number;
}

interface Props {
  rows?: BudgetActualRow[];
  /** Y-axis title / tooltip suffix, e.g. "Cr" or "M". */
  unit: string;
  height?: number;
  /** Drape the Spin overlay during data refetches. */
  loading?: boolean;
}

// Grouped Budget-vs-Actual column chart. The Revenue "Port Wise" card renders
// one bar pair per port (Budget light blue, Actual navy — the Sales/Figma
// series colors). Values arrive pre-scaled to the display unit.
export const BudgetActualColumnChart = ({
  rows,
  unit,
  height = 400,
  loading = false,
}: Props) => {
  const safeRows = useMemo(
    () => (Array.isArray(rows) ? rows : []).filter((r): r is BudgetActualRow => Boolean(r)),
    [rows],
  );

  const options = useMemo<Highcharts.Options>(
    () => ({
      chart: { type: "column", height },
      xAxis: {
        categories: safeRows.map((r) => r.category),
        labels: { rotation: -45, style: { fontSize: "10px", fontStyle: "italic" } },
      },
      yAxis: {
        min: 0,
        title: { text: unit, style: { fontSize: "11px" } },
        labels: { formatter(): string { return fmtK(this.value); } },
      },
      legend: { enabled: true, align: "center", verticalAlign: "bottom", symbolRadius: 6 },
      tooltip: { shared: true, valueSuffix: ` ${unit}`, valueDecimals: 0 },
      plotOptions: {
        column: { groupPadding: 0.12, pointPadding: 0.05, borderRadius: 2 },
      },
      series: [
        { type: "column", name: "Budget", data: safeRows.map((r) => r.budget), color: chartSeries.budget },
        { type: "column", name: "Actual", data: safeRows.map((r) => r.actual), color: chartSeries.actual },
      ],
    }),
    [safeRows, unit, height],
  );

  if (safeRows.length === 0) {
    return <Empty description="No data" style={{ padding: 24 }} />;
  }

  return <Chart loading={loading} options={options} />;
};
