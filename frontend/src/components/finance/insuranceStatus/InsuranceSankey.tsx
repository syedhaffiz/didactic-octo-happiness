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
  /** Full port list (shared port catalogue). Fixes each port's color so it
   *  doesn't shift with filters; ports missing from it are appended. */
  ports?: string[];
  loading?: boolean;
  /** Upper bound on chart height; the chart shrinks when few nodes remain. */
  maxHeight?: number;
}

// Roll-up shown in a hover card — for a node (segment / policy type / port /
// insured party) or a link between two of them.
interface Agg {
  title: string;
  /** Laid out but not shown (collapsed branch) — no tooltip, not clickable. */
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

// Node ids are namespaced per column. Policy-type, port and insured-party
// nodes are shared: several segments can hold the same policy type, several
// policy types can cover the same port, and a party can be insured at several
// ports — so flows merge at those columns.
const segId = (r: InsurancePolicyRow) => `seg:${r.segment}`;
const polId = (r: InsurancePolicyRow) => `pol:${r.policyType}`;
const locId = (r: InsurancePolicyRow) => `loc:${r.location}`;
const ptyId = (r: InsurancePolicyRow) => `pty:${r.insuredParty}`;

// Index of each key's first appearance in `rows` — used to stack a column's
// nodes in the order their inbound flows arrive, which keeps crossings low.
const firstSeen = (rows: InsurancePolicyRow[], key: (r: InsurancePolicyRow) => string) => {
  const order = new Map<string, number>();
  for (const r of rows) if (!order.has(key(r))) order.set(key(r), order.size);
  return order;
};

const sortBy = (rows: InsurancePolicyRow[], rank: (r: InsurancePolicyRow) => number) =>
  [...rows].sort((a, b) => rank(a) - rank(b));

/** Drill-down path: a policy type, then optionally one of its ports. */
interface Expansion {
  policyType?: string;
  location?: string;
}

interface Link {
  from: string;
  to: string;
  color: string;
  agg: Agg;
  /** Whether this band is revealed under a given expansion. */
  shown: (e: Expansion) => boolean;
}

// Builds the full four-column layout every time. Ports and insured parties are
// always laid out but stay hidden (transparent, unlabelled, no tooltip) until
// their branch is expanded — so expanding or collapsing never moves a node.
//   policy type clicked → its ports appear;
//   one of those ports clicked → that policy's insured parties at the port appear.
const buildSeries = (
  policies: InsurancePolicyRow[],
  segments: string[],
  policyTypes: string[],
  ports: string[],
  expansion: Expansion,
) => {
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
  const portColors = colorMap(
    ports,
    policies.map((r) => r.location),
    insuranceColors.ports,
  );
  // Segment column follows the API's segment order (colorMap keys preserve it).
  const segmentRank = new Map([...segmentColors.keys()].map((k, i) => [k, i]));

  const nodeAgg = new Map<string, Agg>();
  const links = new Map<string, Link>();
  const addLink = (
    key: string,
    from: string,
    to: string,
    color: string,
    title: string,
    r: InsurancePolicyRow,
    shown: Link["shown"],
  ) => {
    links.set(key, { from, to, color, shown, agg: mergeAgg(links.get(key)?.agg, title, r) });
  };

  // Column order: segments by the API order; each later column by the first
  // node in the previous column that feeds it.
  const bySegment = sortBy(policies, (r) => segmentRank.get(r.segment) ?? 0);
  const polOrder = firstSeen(bySegment, polId);
  const byPolicy = sortBy(bySegment, (r) => polOrder.get(polId(r)) ?? 0);
  const locOrder = firstSeen(byPolicy, locId);
  const byLocation = sortBy(byPolicy, (r) => locOrder.get(locId(r)) ?? 0);
  const ptyOrder = firstSeen(byLocation, ptyId);

  for (const r of policies) {
    nodeAgg.set(segId(r), mergeAgg(nodeAgg.get(segId(r)), r.segment, r));
    nodeAgg.set(polId(r), mergeAgg(nodeAgg.get(polId(r)), r.policyType, r));
    nodeAgg.set(locId(r), mergeAgg(nodeAgg.get(locId(r)), r.location, r));
    nodeAgg.set(ptyId(r), mergeAgg(nodeAgg.get(ptyId(r)), r.insuredParty, r));
  }

  // Highcharts stacks each column's nodes in the order their links first
  // appear, so emit one level at a time, each in its own sorted row order.
  // Bands after the first column stay split per segment (one band each, in the
  // segment's color) and per policy type, so a flow can be traced through the
  // shared nodes and revealed for just the expanded branch.
  const colorOf = (r: InsurancePolicyRow) => segmentColors.get(r.segment) ?? brand.grey;
  for (const r of bySegment) {
    const [seg, pol] = [segId(r), polId(r)];
    addLink(`${seg}|${pol}`, seg, pol, colorOf(r), `${r.segment} → ${r.policyType}`, r, () => true);
  }
  for (const r of byPolicy) {
    const [seg, pol, loc] = [segId(r), polId(r), locId(r)];
    addLink(
      `${seg}|${pol}|${loc}`,
      pol,
      loc,
      colorOf(r),
      `${r.segment}: ${r.policyType} → ${r.location}`,
      r,
      (e) => e.policyType === r.policyType,
    );
  }
  for (const r of byLocation) {
    const [seg, pol, loc, pty] = [segId(r), polId(r), locId(r), ptyId(r)];
    addLink(
      `${seg}|${pol}|${loc}|${pty}`,
      loc,
      pty,
      colorOf(r),
      `${r.segment}: ${r.policyType} · ${r.location} → ${r.insuredParty}`,
      r,
      (e) => e.policyType === r.policyType && e.location === r.location,
    );
  }

  const linkList = [...links.values()].map((l) => ({ ...l, visible: l.shown(expansion) }));
  // A node in a revealable column shows only when a visible band reaches it.
  const reached = new Set(linkList.filter((l) => l.visible).map((l) => l.to));

  const node = (id: string, column: number, color: string, alwaysShown: boolean) => {
    const shown = alwaysShown || reached.has(id);
    const agg = nodeAgg.get(id);
    return {
      id,
      name: agg?.title ?? id,
      column,
      color: shown ? color : insuranceColors.hidden,
      ...(shown ? {} : { dataLabels: { enabled: false } }),
      custom: agg && { ...agg, hidden: !shown },
    };
  };

  const segOrder = firstSeen(bySegment, segId);
  return {
    nodes: [
      ...[...segOrder.keys()].map((id) =>
        node(id, 0, segmentColors.get(nodeAgg.get(id)?.title ?? "") ?? brand.grey, true),
      ),
      ...[...polOrder.keys()].map((id) =>
        node(id, 1, policyColors.get(nodeAgg.get(id)?.title ?? "") ?? brand.grey, true),
      ),
      ...[...locOrder.keys()].map((id) =>
        node(id, 2, portColors.get(nodeAgg.get(id)?.title ?? "") ?? brand.grey, false),
      ),
      ...[...ptyOrder.keys()].map((id) => node(id, 3, insuranceColors.partyNode, false)),
    ],
    data: linkList.map(({ from, to, color, agg, visible }) => ({
      from,
      to,
      color: visible ? color : insuranceColors.hidden,
      weight: agg.sumInsured,
      custom: { ...agg, hidden: !visible },
    })),
    columnSizes: [segOrder.size, polOrder.size, locOrder.size, ptyOrder.size],
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

// One line describing the current drill-down, so the user knows what the next
// click does.
const hintFor = (e: Expansion) => {
  if (e.policyType && e.location)
    return `Showing insured parties for ${e.policyType} at ${e.location} — click ${e.location} again to collapse.`;
  if (e.policyType)
    return `Showing ports for ${e.policyType} — click a port to see its insured parties, or click ${e.policyType} again to collapse.`;
  return "Click a policy type to see its ports.";
};

// "Active Insurance Analysis" Sankey: segment → policy type, with link widths
// proportional to sum insured. Clicking a policy type branches it out to its
// ports; clicking one of those ports branches out to its insured parties.
// Clicking an expanded node again collapses it; clicking another policy type
// switches branches. Hovering any visible node or link shows its sum insured,
// stock value, policy period and status.
export const InsuranceSankey = ({
  policies,
  segments = [],
  policyTypes = [],
  ports = [],
  loading = false,
  maxHeight = 640,
}: Props) => {
  const { text: labelColor, textSecondary } = useBrandTokens();
  const [expansion, setExpansion] = useState<Expansion>({});
  // Only the first render animates in. Toggling rebuilds the chart, and
  // replaying the entry animation then would read as the layout jumping.
  const [interacted, setInteracted] = useState(false);

  // Drop any part of the drill-down that a filter has removed from the data.
  const active = useMemo<Expansion>(() => {
    const rows = policies ?? [];
    const policyType = rows.some((r) => r.policyType === expansion.policyType)
      ? expansion.policyType
      : undefined;
    const location =
      policyType &&
      rows.some((r) => r.policyType === policyType && r.location === expansion.location)
        ? expansion.location
        : undefined;
    return { policyType, location };
  }, [policies, expansion]);

  const options = useMemo<Highcharts.Options>(() => {
    const { nodes, data, columnSizes } = buildSeries(
      policies ?? [],
      segments,
      policyTypes,
      ports,
      active,
    );
    // Size to the busiest column so a narrowed filter doesn't stretch two or
    // three bands across the full canvas. Every column is always laid out, so
    // this never changes on expand / collapse.
    const busiest = Math.max(...columnSizes);
    const height = Math.min(maxHeight, Math.max(320, busiest * 44 + 80));
    return {
      chart: {
        height,
        marginLeft: 140,
        marginRight: 200,
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
          nodePadding: 30,
          minLinkWidth: 3,
          linkOpacity: 0.22,
          borderWidth: 0,
          curveFactor: 0.5,
          states: { hover: { linkOpacity: 0.45 } },
          ...(interacted ? { animation: false } : {}),
          point: {
            events: {
              click: function () {
                const p = this as unknown as {
                  isNode?: boolean;
                  id?: string;
                  name?: string;
                  options: { custom?: Agg };
                };
                // Hidden nodes are still laid out (and hit-testable) — ignore them.
                if (!p.isNode || !p.id || !p.name || p.options.custom?.hidden) return;
                const name = p.name;
                if (p.id.startsWith("pol:")) {
                  setInteracted(true);
                  setExpansion((cur) => (cur.policyType === name ? {} : { policyType: name }));
                } else if (p.id.startsWith("loc:")) {
                  setInteracted(true);
                  setExpansion((cur) =>
                    cur.location === name
                      ? { policyType: cur.policyType }
                      : { policyType: cur.policyType, location: name },
                  );
                }
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
          // policy types and ports above theirs (bands leave both sides),
          // insured parties to the right.
          levels: [
            { level: 0, dataLabels: { align: "right", x: -20, verticalAlign: "middle" } },
            { level: 1, dataLabels: { align: "center", verticalAlign: "top", y: -22 } },
            { level: 2, dataLabels: { align: "center", verticalAlign: "top", y: -22 } },
            { level: 3, dataLabels: { align: "left", x: 20, verticalAlign: "middle" } },
          ],
        },
      ],
    };
  }, [policies, segments, policyTypes, ports, active, interacted, maxHeight, labelColor]);

  if (!loading && (policies ?? []).length === 0) {
    return <Empty description="No policies match the selected filters" style={{ padding: 48 }} />;
  }

  return (
    <>
      {/* Single fixed-height line in every state so the hint never shifts the chart. */}
      <Typography.Text
        ellipsis
        style={{ display: "block", fontSize: 12, color: textSecondary, lineHeight: "20px" }}
      >
        {hintFor(active)}
      </Typography.Text>
      <Chart options={options} loading={loading} />
    </>
  );
};
