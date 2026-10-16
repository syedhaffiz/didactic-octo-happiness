import { useMemo } from "react";
import type Highcharts from "highcharts";
import { Empty } from "antd";
import dayjs from "dayjs";
import { Chart } from "../../Chart";
import { brand, insuranceColors } from "../../../theme/tokens";
import { useBrandTokens } from "../../../theme/useBrandTokens";
import { formatInr } from "../../../utils/format";
import type { InsurancePolicyRow, InsuranceStatus } from "../../../types/finance";

interface Props {
  policies: InsurancePolicyRow[] | undefined;
  loading?: boolean;
  /** Upper bound on chart height; the chart shrinks when few locations remain. */
  maxHeight?: number;
}

// Roll-up shown in a hover card — for a node (segment / policy type / location)
// or a link between two of them.
interface Agg {
  title: string;
  sumInsured: number;
  stockValue: number;
  periodStart: string;
  periodEnd: string;
  status: InsuranceStatus;
}

const PERIOD_FMT = "DD MMM YYYY";

// Figma stacks the Sankey's segment column in this order (differs from the KPI
// strip). Unknown segments sort after these, keeping response order.
const SANKEY_SEGMENT_ORDER = ["ICM", "Bunkering", "Sagarmala", "Rock Phosphate"];
const sankeyRank = (segment: string) => {
  const i = SANKEY_SEGMENT_ORDER.indexOf(segment);
  return i === -1 ? SANKEY_SEGMENT_ORDER.length : i;
};

const segmentColor = (segment: string) =>
  insuranceColors.segments[segment] ?? insuranceColors.segmentFallback;

const mergeAgg = (prev: Agg | undefined, title: string, r: InsurancePolicyRow): Agg =>
  prev
    ? {
        title,
        sumInsured: prev.sumInsured + r.sumInsured,
        stockValue: prev.stockValue + r.stockValue,
        periodStart: r.periodStart < prev.periodStart ? r.periodStart : prev.periodStart,
        periodEnd: r.periodEnd > prev.periodEnd ? r.periodEnd : prev.periodEnd,
        status: prev.status !== "Active" ? prev.status : r.status,
      }
    : {
        title,
        sumInsured: r.sumInsured,
        stockValue: r.stockValue,
        periodStart: r.periodStart,
        periodEnd: r.periodEnd,
        status: r.status,
      };

// Node ids are namespaced per column. Policy-type nodes are scoped to their
// segment (two segments can both hold a "Marine Policy") so each keeps its
// segment's color; insured locations are shared across policies.
const segId = (r: InsurancePolicyRow) => `seg:${r.segment}`;
const polId = (r: InsurancePolicyRow) => `pol:${r.segment}:${r.policyType}`;
const locId = (r: InsurancePolicyRow) => `loc:${r.location}`;

const buildSeries = (policies: InsurancePolicyRow[]) => {
  const nodes = new Map<string, Highcharts.SeriesSankeyNodesOptionsObject>();
  const nodeAgg = new Map<string, Agg>();
  const linkAgg = new Map<string, { from: string; to: string; agg: Agg }>();

  const addLink = (from: string, to: string, title: string, r: InsurancePolicyRow) => {
    const key = `${from}|${to}`;
    linkAgg.set(key, { from, to, agg: mergeAgg(linkAgg.get(key)?.agg, title, r) });
  };

  // Stable sort, so rows within a segment keep their response order.
  const ordered = [...policies].sort((a, b) => sankeyRank(a.segment) - sankeyRank(b.segment));

  for (const r of ordered) {
    const color = segmentColor(r.segment);
    if (!nodes.has(segId(r))) nodes.set(segId(r), { id: segId(r), name: r.segment, color, column: 0 });
    if (!nodes.has(polId(r))) nodes.set(polId(r), { id: polId(r), name: r.policyType, color, column: 1 });
    if (!nodes.has(locId(r)))
      nodes.set(locId(r), {
        id: locId(r),
        name: r.location,
        color: insuranceColors.locationNode,
        column: 2,
      });

    nodeAgg.set(segId(r), mergeAgg(nodeAgg.get(segId(r)), r.segment, r));
    nodeAgg.set(polId(r), mergeAgg(nodeAgg.get(polId(r)), `${r.segment} → ${r.policyType}`, r));
    nodeAgg.set(locId(r), mergeAgg(nodeAgg.get(locId(r)), r.location, r));

    addLink(segId(r), polId(r), `${r.segment} → ${r.policyType}`, r);
    addLink(polId(r), locId(r), `${r.policyType} → ${r.location}`, r);
  }

  return {
    nodes: [...nodes.values()].map((n) => ({ ...n, custom: nodeAgg.get(n.id as string) })),
    data: [...linkAgg.values()].map(({ from, to, agg }) => ({
      from,
      to,
      weight: agg.sumInsured,
      custom: agg,
    })),
  };
};

// Hover card markup — a colored swatch + title over label/value rows, matching
// the Figma's tooltip. Colors come from tokens; the swatch uses the point color.
const tooltipHtml = (agg: Agg, color: string) => {
  const row = (label: string, value: string) =>
    `<tr><td style="color:${brand.textMuted};padding:3px 24px 3px 0">${label}</td>` +
    `<td style="text-align:right;font-weight:500;color:${brand.black}">${value}</td></tr>`;
  const period = `${dayjs(agg.periodStart).format(PERIOD_FMT)} – ${dayjs(agg.periodEnd).format(PERIOD_FMT)}`;
  const statusColor = agg.status === "Active" ? brand.black : brand.danger;
  return (
    `<div style="padding:4px 2px;font-size:12px">` +
    `<div style="display:flex;align-items:center;gap:8px;font-weight:600;font-size:13px;` +
    `color:${brand.black};padding-bottom:6px;margin-bottom:4px;border-bottom:1px solid ${brand.border}">` +
    `<span style="width:10px;height:10px;border-radius:2px;background:${color}"></span>${agg.title}</div>` +
    `<table>` +
    row("Sum Insured", formatInr(agg.sumInsured)) +
    row("Stock Value", formatInr(agg.stockValue)) +
    row("Policy Period", period) +
    `<tr><td style="color:${brand.textMuted};padding:3px 24px 3px 0">Status</td>` +
    `<td style="text-align:right;font-weight:600;color:${statusColor}">${agg.status}</td></tr>` +
    `</table></div>`
  );
};

// "Active Insurance Analysis" Sankey: segment → policy type → insured location,
// with link widths proportional to sum insured. Hovering any node or link shows
// its sum insured, stock value, policy period and status.
export const InsuranceSankey = ({ policies, loading = false, maxHeight = 640 }: Props) => {
  const { text: labelColor } = useBrandTokens();
  const options = useMemo<Highcharts.Options>(() => {
    const { nodes, data } = buildSeries(policies ?? []);
    // Size to the busiest column (locations) so a narrowed filter doesn't
    // stretch two or three bands across the full canvas.
    const locations = nodes.filter((n) => n.column === 2).length;
    const height = Math.min(maxHeight, Math.max(320, locations * 44 + 80));
    return {
      chart: { height, marginLeft: 140, marginRight: 220, marginTop: 30 },
      legend: { enabled: false },
      tooltip: {
        useHTML: true,
        outside: true,
        padding: 12,
        formatter: function () {
          const p = this as unknown as {
            color?: string;
            options: { custom?: Agg };
          };
          const agg = p.options.custom;
          return agg ? tooltipHtml(agg, p.color ?? brand.grey) : false;
        },
      },
      plotOptions: {
        sankey: {
          nodeWidth: 12,
          nodePadding: 34,
          minLinkWidth: 3,
          linkOpacity: 0.22,
          borderWidth: 0,
          curveFactor: 0.5,
          states: { hover: { linkOpacity: 0.45 } },
          dataLabels: {
            enabled: true,
            nodeFormat: "{point.name}",
            crop: false,
            overflow: "allow",
            style: {
              color: labelColor,
              fontSize: "13px",
              fontWeight: "400",
              textOutline: "none",
            },
          },
        },
      },
      series: [
        {
          type: "sankey",
          name: "Active Insurance",
          keys: ["from", "to", "weight"],
          nodes,
          data,
          // Per-column label placement: segments to the left of their bar,
          // policy types above theirs, locations to the right.
          levels: [
            { level: 0, dataLabels: { align: "right", x: -20, verticalAlign: "middle" } },
            { level: 1, dataLabels: { align: "center", verticalAlign: "top", y: -24 } },
            { level: 2, dataLabels: { align: "left", x: 20, verticalAlign: "middle" } },
          ],
        },
      ],
    };
  }, [policies, maxHeight, labelColor]);

  if (!loading && (policies ?? []).length === 0) {
    return <Empty description="No policies match the selected filters" style={{ padding: 48 }} />;
  }

  return <Chart options={options} loading={loading} />;
};
