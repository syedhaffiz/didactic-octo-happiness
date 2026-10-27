import { useMemo } from "react";
import { Card, Empty, Skeleton, Table, Tooltip } from "antd";
import { BarChartOutlined } from "@ant-design/icons";
import type Highcharts from "highcharts";
import type { ColumnsType } from "antd/es/table";
import { Chart } from "../../Chart";
import { CardTitle } from "../../CardTitle";
import { iiaBillingColors } from "../../../theme/tokens";
import { formatCrLakh, formatInr } from "../../../utils/format";
import type { IiaPortVendorAmount } from "../../../types/marketing";

const VENDOR_COLORS = iiaBillingColors.vendors;

// The flat (port, vendor, amount) list pivoted for the chart and table. Ports
// read A→Z along the axis; vendors are listed Z→A as in the design, and a
// vendor's position fixes its colour in both the stack and the table dot.
interface PortVendorPivot {
  ports: string[];
  vendors: { name: string; color: string; byPort: Record<string, number> }[];
}

const pivot = (rows: IiaPortVendorAmount[] | undefined): PortVendorPivot => {
  // Drop malformed entries rather than letting one bad row blank the card.
  const clean = (Array.isArray(rows) ? rows : []).filter(
    (r): r is IiaPortVendorAmount =>
      Boolean(r) &&
      typeof r.port === "string" &&
      r.port !== "" &&
      typeof r.vendor === "string" &&
      r.vendor !== "" &&
      Number.isFinite(r.amount),
  );

  const ports = [...new Set(clean.map((r) => r.port))].sort((a, b) => a.localeCompare(b));
  const byVendor = new Map<string, Record<string, number>>();
  for (const r of clean) {
    const cells = byVendor.get(r.vendor) ?? {};
    cells[r.port] = (cells[r.port] ?? 0) + r.amount;
    byVendor.set(r.vendor, cells);
  }
  const vendors = [...byVendor.keys()]
    .sort((a, b) => b.localeCompare(a))
    .map((name, i) => ({
      name,
      color: VENDOR_COLORS[i % VENDOR_COLORS.length],
      byPort: byVendor.get(name) ?? {},
    }));
  return { ports, vendors };
};

type TableRow = PortVendorPivot["vendors"][number];

// Raw cell amount (as the design shows), blank where the vendor didn't bill
// at that port.
const fmtCell = (v: number | undefined) =>
  v === undefined ? "" : String(Math.round(v * 100) / 100);

interface Props {
  rows?: IiaPortVendorAmount[];
  loading: boolean;
}

// "IIA Billing by Port & Vendor": a stacked column per port (one stack segment
// per vendor, the port total on top) above a vendor × port amount table. Both
// render from the same pivot so colours and figures always agree.
export const IiaPortVendorCard = ({ rows, loading }: Props) => {
  const data = useMemo(() => pivot(rows), [rows]);
  const empty = data.ports.length === 0;

  const options = useMemo<Highcharts.Options>(
    () => ({
      chart: { type: "column", height: 360 },
      xAxis: {
        categories: data.ports,
        labels: { style: { fontSize: "10px" } },
      },
      yAxis: {
        title: { text: "Amount (₹)", style: { fontSize: "11px" } },
        labels: { formatter(): string { return formatCrLakh(Number(this.value ?? 0)); } },
        stackLabels: {
          enabled: true,
          // Port total above each stack; credit-note-only stacks below zero
          // stay unlabelled.
          formatter(): string {
            return this.isNegative ? "" : formatCrLakh(Number(this.total ?? 0));
          },
          style: { fontSize: "10px", fontWeight: "600", textOutline: "none" },
        },
      },
      legend: { enabled: true, align: "center", verticalAlign: "bottom", symbolRadius: 6 },
      tooltip: {
        headerFormat: "<b>{point.key}</b><br/>",
        pointFormatter(this: Highcharts.Point): string {
          return `${this.series.name}: <b>${formatInr(this.y ?? 0)}</b>`;
        },
      },
      plotOptions: {
        column: { stacking: "normal", borderRadius: 0, pointPadding: 0.1, maxPointWidth: 40 },
      },
      series: data.vendors.map((v) => ({
        type: "column" as const,
        name: v.name,
        color: v.color,
        data: data.ports.map((p) => v.byPort[p] ?? null),
      })),
    }),
    [data],
  );

  const columns = useMemo<ColumnsType<TableRow>>(
    () => [
      {
        key: "vendor",
        title: "Vendor",
        dataIndex: "name",
        fixed: "left",
        width: 300,
        ellipsis: { showTitle: false },
        render: (name: string, row) => (
          <Tooltip title={name} placement="topLeft">
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <span
                aria-hidden
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: row.color,
                  flex: "none",
                }}
              />
              {name}
            </span>
          </Tooltip>
        ),
      },
      ...data.ports.map((port) => ({
        key: port,
        title: port,
        width: 130,
        align: "right" as const,
        render: (_: unknown, row: TableRow) => fmtCell(row.byPort[port]),
      })),
    ],
    [data],
  );

  return (
    <Card
      title={<CardTitle icon={<BarChartOutlined />}>IIA Billing by Port &amp; Vendor</CardTitle>}
      style={{ marginBottom: 16 }}
    >
      {loading && empty ? (
        <Skeleton active paragraph={{ rows: 8 }} />
      ) : empty ? (
        <Empty description="No billing for the selected filters" style={{ padding: 24 }} />
      ) : (
        <>
          <Chart options={options} loading={loading} />
          <Table<TableRow>
            rowKey="name"
            size="small"
            columns={columns}
            dataSource={data.vendors}
            loading={loading}
            pagination={false}
            scroll={{ x: "max-content" }}
            style={{ marginTop: 16 }}
          />
        </>
      )}
    </Card>
  );
};
