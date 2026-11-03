import { useMemo, useState } from "react";
import type Highcharts from "highcharts";
import { Empty, Typography } from "antd";
import dayjs from "dayjs";
import { Chart } from "../../Chart";
import { brand, insuranceColors } from "../../../theme/tokens";
import { useBrandTokens } from "../../../theme/useBrandTokens";
import { formatInr } from "../../../utils/format";
import type { InsurancePolicyRow, InsuranceStatus } from "../../../types/finance";

interface Props {
  policies: InsurancePolicyRow[] | undefined;
  /** Full segment list from the API (unfiltered order). Fixes the segment
   *  column order and each segment's color, so neither shifts with filters. */
  segments?: string[];
  /** Full policy-type list from the API (filter options). Fixes each policy
   *  type's color so it doesn't shift with filters. */
  policyTypes?: string[];
  loading?: boolean;
  /** Upper bound on chart height; the chart shrinks when few ports remain. */
  maxHeight?: number;
}

// Roll-up shown in a hover card — for a node (segment / policy type / port)
// or a link between two of them.
interface Agg {
  title: string;
  /** Laid out but not shown (collapsed port column) — no tooltip. */
  hidden?: boolean;
  sumInsured: number;
  stockValue: number;
  periodStart: string;
  periodEnd: string;
  status: InsuranceStatus;
}

const PERIOD_FMT = "DD MMM YYYY";

// Assigns each key a palette color by its position in `known` (the stable,
// API-provided list), cycling if the palette is exceeded. Keys that only
// appear in `extra` (absent from `known`) are appended after it, so any value
// the API returns still gets a color.
const colorMap = (known: string[], extra: string[], palette: readonly string[]) => {
  const keys = [...new Set([...known, ...extra])];
  return new Map(keys.map((k, i) => [k, palette[i % palette.length]]));
};

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

// Node ids are namespaced per column. Policy-type and port nodes are shared:
// several segments can hold the same policy type, and several policy types can
// cover the same port, so flows merge at those columns.
const segId = (r: InsurancePolicyRow) => `seg:${r.segment}`;
const polId = (r: InsurancePolicyRow) => `pol:${r.policyType}`;
const locId = (r: InsurancePolicyRow) => `loc:${r.location}`;

// Index of each key's first appearance in `rows` — used to stack a column's
// nodes in the order their inbound flows arrive, which keeps crossings low.
const firstSeen = (rows: InsurancePolicyRow[], key: (r: InsurancePolicyRow) => string) => {
  const order = new Map<string, number>();
  for (const r of rows) if (!order.has(key(r))) order.set(key(r), order.size);
  return order;
};

// Builds the full three-column layout every time. Ports are always laid out
// but stay hidden (transparent, unlabelled, no tooltip) unless they hang off
// the `expanded` policy type — so expanding or collapsing never moves a node.
const buildSeries = (
  policies: InsurancePolicyRow[],
  segments: string[],
  policyTypes: string[],
  expanded: string | undefined,
) => {
  const expandedId = expanded ? `pol:${expanded}` : undefined;
  const segmentColors = colorMap(
    segments,
    policies.map((r) => r.segment),
    insuranceColors.segments,
  );
  const policyColors = colorMap(
    policyTypes,
    policies.map((r) => r.policyType),
    insuranceColors.policyTypes,
  );
  // Segment column follows the API's segment order (colorMap keys preserve it).
  const segmentRank = new Map([...segmentColors.keys()].map((k, i) => [k, i]));

  const nodeAgg = new Map<string, Agg>();
  const linkAgg = new Map<string, { from: string; to: string; color: string; agg: Agg }>();

  const addLink = (from: string, to: string, color: string, title: string, r: InsurancePolicyRow, key: string) => {
    linkAgg.set(key, { from, to, color, agg: mergeAgg(linkAgg.get(key)?.agg, title, r) });
  };

  // Column order: segments by the API order; policy types by the first
  // segment that holds them; ports by the first policy type that covers them.
  const bySegment = [...policies].sort(
    (a, b) => (segmentRank.get(a.segment) ?? 0) - (segmentRank.get(b.segment) ?? 0),
  );
  const polOrder = firstSeen(bySegment, polId);
  const byPolicy = [...bySegment].sort(
    (a, b) => (polOrder.get(polId(a)) ?? 0) - (polOrder.get(polId(b)) ?? 0),
  );
  const portOrder = firstSeen(byPolicy, locId);

  for (const r of byPolicy) {
    const color = segmentColors.get(r.segment) ?? brand.grey;
    nodeAgg.set(segId(r), mergeAgg(nodeAgg.get(segId(r)), r.segment, r));
    nodeAgg.set(polId(r), mergeAgg(nodeAgg.get(polId(r)), r.policyType, r));
    nodeAgg.set(locId(r), mergeAgg(nodeAgg.get(locId(r)), r.location, r));

    addLink(segId(r), polId(r), color, `${r.segment} → ${r.policyType}`, r, `${segId(r)}|${polId(r)}`);
    // Policy → port links stay split per segment (one band each, in the
    // segment's color) so a flow can be traced through the shared nodes.
    addLink(
      polId(r),
      locId(r),
      color,
      `${r.segment}: ${r.policyType} → ${r.location}`,
      r,
      `${segId(r)}|${polId(r)}|${locId(r)}`,
    );
  }

  const segNodes = [...new Set(bySegment.map((r) => r.segment))].map((segment) => ({
    id: `seg:${segment}`,
    name: segment,
    color: segmentColors.get(segment) ?? brand.grey,
    column: 0,
  }));
  const polNodes = [...polOrder.keys()].map((id) => {
    const name = nodeAgg.get(id)?.title ?? id;
    return { id, name, color: policyColors.get(name) ?? brand.grey, column: 1 };
  });
  // Ports fed by the expanded policy type.
  const shownPorts = new Set(
    [...linkAgg.values()].filter((l) => l.from === expandedId).map((l) => l.to),
  );
  const portNodes = [...portOrder.keys()].map((id) => {
    const shown = shownPorts.has(id);
    return {
      id,
      name: nodeAgg.get(id)?.title ?? id,
      color: shown ? insuranceColors.portNode : insuranceColors.hidden,
      column: 2,
      dataLabels: { enabled: shown },
      hidden: !shown,
    };
  });

  return {
    nodes: [
      ...segNodes.map((n) => ({ ...n, hidden: false })),
      ...polNodes.map((n) => ({ ...n, hidden: false })),
      ...portNodes,
    ].map(({ hidden, ...n }) => {
      const agg = nodeAgg.get(n.id);
      return { ...n, custom: agg && { ...agg, hidden } };
    }),
    data: [...linkAgg.values()].map(({ from, to, color, agg }) => {
      // Segment → policy links always show; policy → port only when expanded.
      const hidden = from.startsWith("pol:") && from !== expandedId;
      return {
        from,
        to,
        color: hidden ? insuranceColors.hidden : color,
        weight: agg.sumInsured,
        custom: { ...agg, hidden },
      };
    }),
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

// "Active Insurance Analysis" Sankey: segment → policy type, with link widths
// proportional to sum insured. Clicking a policy type branches it out to its
// ports (clicking it again, or another policy type, collapses / switches).
// Hovering any visible node or link shows its sum insured, stock value, policy
// period and status.
export const InsuranceSankey = ({
  policies,
  segments = [],
  policyTypes = [],
  loading = false,
  maxHeight = 640,
}: Props) => {
  const { text: labelColor, textSecondary } = useBrandTokens();
  const [expanded, setExpanded] = useState<string | undefined>();
  // Only the first render animates in. Toggling rebuilds the chart, and
  // replaying the entry animation then would read as the layout jumping.
  const [interacted, setInteracted] = useState(false);

  // A policy type that a filter removed can't stay expanded.
  const activeExpanded =
    expanded && (policies ?? []).some((r) => r.policyType === expanded) ? expanded : undefined;

  const options = useMemo<Highcharts.Options>(() => {
    const { nodes, data } = buildSeries(policies ?? [], segments, policyTypes, activeExpanded);
    // Size to the busiest column (ports) so a narrowed filter doesn't stretch
    // two or three bands across the full canvas.
    const ports = nodes.filter((n) => n.column === 2).length;
    const height = Math.min(maxHeight, Math.max(320, ports * 48 + 80));
    return {
      chart: {
        height,
        marginLeft: 140,
        marginRight: 160,
        marginTop: 30,
        animation: interacted ? false : undefined,
      },
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
          return agg && !agg.hidden ? tooltipHtml(agg, p.color ?? brand.grey) : false;
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
          ...(interacted ? { animation: false } : {}),
          point: {
            events: {
              click: function () {
                // Policy-type nodes are the only ids namespaced "pol:".
                const p = this as unknown as { isNode?: boolean; id?: string; name?: string };
                if (!p.isNode || !p.id?.startsWith("pol:") || !p.name) return;
                const name = p.name;
                setInteracted(true);
                setExpanded((cur) => (cur === name ? undefined : name));
              },
            },
          },
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
          cursor: "pointer",
          keys: ["from", "to", "weight"],
          nodes,
          data,
          // Per-column label placement: segments to the left of their bar,
          // policy types above theirs, ports to the right.
          levels: [
            { level: 0, dataLabels: { align: "right", x: -20, verticalAlign: "middle" } },
            { level: 1, dataLabels: { align: "center", verticalAlign: "top", y: -24 } },
            { level: 2, dataLabels: { align: "left", x: 20, verticalAlign: "middle" } },
          ],
        },
      ],
    };
  }, [policies, segments, policyTypes, activeExpanded, interacted, maxHeight, labelColor]);

  if (!loading && (policies ?? []).length === 0) {
    return <Empty description="No policies match the selected filters" style={{ padding: 48 }} />;
  }

  return (
    <>
      {/* Single fixed-height line in both states so the hint never shifts the chart. */}
      <Typography.Text
        ellipsis
        style={{ display: "block", fontSize: 12, color: textSecondary, lineHeight: "20px" }}
      >
        {activeExpanded
          ? `Showing ports for ${activeExpanded} — click it again to collapse, or click another policy type.`
          : "Click a policy type to see its ports."}
      </Typography.Text>
      <Chart options={options} loading={loading} />
    </>
  );
};
