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
        formatter(this: Highcharts.TooltipFormatterContextObject): string {
          const stack = (this.series.options as { stack?: string }).stack ?? "";
          const entities: string[] = (this.point.options as { custom?: { entities?: string[] } }).custom?.entities ?? [];
          let html = `<div style="font-family:Arial,sans-serif;font-size:12px;min-width:180px;">`;
          html += `<div style="font-size:14px;font-weight:700;color:${brand.headline};border-bottom:1px solid #ccc;padding-bottom:5px;margin-bottom:5px;">`;
          html += `${this.key} <span style="font-size:11px;color:#666;">(${stack} Stack)</span></div>`;
          html += `<b>Segment:</b> <span style="color:${String(this.color)}">■</span> ${this.series.name}<br/>`;
          html += `<b>Total Volume:</b> ${Highcharts.numberFormat(this.y ?? 0, 0)} MT<br/>`;
          if (entities.length > 0) {
            html += `<div style="margin-top:8px;background:#f4f6f9;padding:6px;border-radius:4px;border:1px solid #eee;">`;
            html += `<b style="color:#333;">Key Entities Included:</b><br/>`;
            html += `<ul style="margin:4px 0 0 0;padding-left:15px;color:#444;">`;
            entities.forEach((e) => { html += `<li>${e}</li>`; });
            html += `</ul></div>`;
          }
          html += `</div>`;
          return html;
        },
      },
      plotOptions: {
        column: { stacking: "normal", borderWidth: 0, dataLabels: { enabled: false } },
      },
      series: [
        { type: "column", name: "Shipper Own", stack: "Shipper", color: own,
          data: safe.map((r) => ({ y: r.shipperOwn, custom: { entities: r.shipperOwnEntities ?? [] } })) },
        { type: "column", name: "Shipper Non-Own", stack: "Shipper", color: nonOwn,
          data: safe.map((r) => ({ y: r.shipperNonOwn, custom: { entities: r.shipperNonOwnEntities ?? [] } })) },
        { type: "column", name: "Own Receiver", stack: "Receiver", color: receiverOwn,
          data: safe.map((r) => ({ y: r.receiverOwn, custom: { entities: r.receiverOwnEntities ?? [] } })) },
        { type: "column", name: "Non-Own Receiver", stack: "Receiver", color: receiverNonOwn,
          data: safe.map((r) => ({ y: r.receiverNonOwn, custom: { entities: r.receiverNonOwnEntities ?? [] } })) },
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
