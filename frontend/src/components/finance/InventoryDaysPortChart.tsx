import { Empty } from "antd";
import { Chart } from "../Chart";
import { brand } from "../../theme/tokens";
import type { InventoryDaysPortItem } from "../../types/finance";

interface Props {
  rows?: InventoryDaysPortItem[];
  loading: boolean;
}

// Port Wise inventory-days chart — a single-series purple column chart, one bar
// per port, with a "Days" y-axis. Days display in an antd-style tooltip via the
// Highcharts tooltip (raw value + unit).
const options = (rows: InventoryDaysPortItem[]): Highcharts.Options => ({
  chart: { type: "column", height: 320, backgroundColor: "transparent" },
  xAxis: { categories: rows.map((r) => r.port) },
  yAxis: { title: { text: "Days", style: { fontSize: "11px" } } },
  legend: { enabled: false },
  tooltip: { valueSuffix: " Days" },
  plotOptions: { column: { maxPointWidth: 26, dataLabels: { enabled: false } } },
  series: [
    {
      type: "column",
      name: "Inventory Days",
      data: rows.map((r) => r.days),
      color: brand.purple,
    },
  ],
});

export const InventoryDaysPortChart = ({ rows, loading }: Props) => {
  // Drop malformed rows so a bad payload can't crash the chart.
  const safeRows = (Array.isArray(rows) ? rows : []).filter(
    (r): r is InventoryDaysPortItem => r != null && typeof r.days === "number",
  );
  // Keep the chart mounted while loading (it draws its own overlay); only fall
  // back to Empty once a settled response has no ports.
  if (!loading && safeRows.length === 0) {
    return <Empty description="No port data" />;
  }
  return <Chart loading={loading} options={options(safeRows)} />;
};
