import { useMemo } from "react";
import { Card, Empty } from "antd";
import Highcharts from "highcharts";
import { Chart } from "../Chart";
import { ErrorBoundary } from "../ErrorBoundary";
import { marketingColors, brand, fontFamily } from "../../theme/tokens";
import { fmtK } from "../../utils/format";
import type { ShipperReceiverRow } from "../../types/marketing";

const { own, nonOwn, receiverOwn, receiverNonOwn } = marketingColors.marketShare;

interface Props {
  title: string;
  rows?: ShipperReceiverRow[];
  loading?: boolean;
  height?: number;
}

// Stacked + grouped column chart: at each port a "Shipper" stack and a
// "Receiver" stack sit side by side, each split Own / Non-Own. The two stacks
// are placed in distinct columns via Highcharts' `stack` grouping.
export const ShipperReceiverCard = ({ title, rows, loading, height = 420 }: Props) => {
  const options = useMemo<Highcharts.Options>(() => {
    const safe = Array.isArray(rows) ? rows : [];
    const categories = safe.map((r) => r.port);
    return {
      chart: { type: "column", height, style: { fontFamily } },
      title: { text: undefined },
      xAxis: {
        categories,
        crosshair: true,
        labels: { style: { fontSize: "10px", fontWeight: "bold" } },
      },
      yAxis: {
        min: 0,
        title: { text: "Volume (MT)", style: { fontSize: "11px" } },
        labels: { formatter(): string { return fmtK(this.value); } },
        stackLabels: {
          enabled: true,
          formatter(): string { return this.total && this.total > 0 ? fmtK(this.total) : ""; },
          style: { fontWeight: "bold", color: brand.textMuted, fontSize: "9px" },
        },
      },
      legend: { enabled: true, align: "center", verticalAlign: "bottom", symbolRadius: 6 },
      tooltip: {
        shared: false,
        useHTML: true,
        headerFormat: "",
        pointFormatter(this: Highcharts.Point): string {
          const s = this.series;
          const stack = (s.options as { stack?: string }).stack ?? "";
          return (
            `<span style="font-size:13px;font-weight:700;color:${brand.headline}">${this.category} <span style="font-size:11px;color:#888">(${stack})</span></span><br/>` +
            `<span style="color:${this.color}">■</span> ${s.name}: <b>${Highcharts.numberFormat(this.y ?? 0, 0)} MT</b>`
          );
        },
      },
      plotOptions: {
        column: { stacking: "normal", borderWidth: 0, dataLabels: { enabled: false } },
      },
      series: [
        { type: "column", name: "Shipper Own", stack: "Shipper", color: own,
          data: safe.map((r) => r.shipperOwn) },
        { type: "column", name: "Shipper Non-Own", stack: "Shipper", color: nonOwn,
          data: safe.map((r) => r.shipperNonOwn) },
        { type: "column", name: "Own Receiver", stack: "Receiver", color: receiverOwn,
          data: safe.map((r) => r.receiverOwn) },
        { type: "column", name: "Non-Own Receiver", stack: "Receiver", color: receiverNonOwn,
          data: safe.map((r) => r.receiverNonOwn) },
      ],
    };
  }, [rows, height]);

  const hasData = (rows?.length ?? 0) > 0;

  return (
    <Card
      title={<span style={{ fontWeight: 700, fontSize: 15 }}>{title}</span>}
      styles={{ header: { borderBottom: "none" }, body: { paddingTop: 0 } }}
    >
      {!hasData && !loading ? (
        <Empty description="No data" style={{ padding: 32 }} />
      ) : (
        <ErrorBoundary level="section" label={title}>
          <Chart loading={loading} options={options} />
        </ErrorBoundary>
      )}
    </Card>
  );
};
