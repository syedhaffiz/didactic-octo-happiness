import { useMemo } from "react";
import { Empty, Skeleton } from "antd";
import dayjs from "dayjs";
import type Highcharts from "highcharts";
import { Chart } from "../../Chart";
import { useBrandTokens } from "../../../theme/useBrandTokens";
import { brand, fontFamily, qualityColors } from "../../../theme/tokens";
import { formatGcv, type NormalizedQuality, type QualityChartPoint } from "./qualityFormat";

interface Props {
  data?: NormalizedQuality;
  loading: boolean;
}

// Beyond a month of daily points the markers turn into noise — hide them and
// let the hover state show the point instead.
const MARKER_LIMIT = 31;

const Y_AXIS_BASE: Highcharts.YAxisOptions = {
  title: { text: undefined },
  labels: { style: { color: brand.textMuted, fontFamily, fontSize: "12px" } },
};

interface SeriesSpec {
  name: string;
  color: string;
  value: (p: QualityChartPoint) => number | null;
  dashed?: boolean;
  // Stretch of the x-axis (0 = start, 1 = end) the inline series label may sit
  // in. The three stretches don't overlap, so the labels never collide.
  labelSpan: [number, number];
}

const SERIES: SeriesSpec[] = [
  {
    name: "LP Variance",
    color: qualityColors.lpVariance,
    value: (p) => p.lpVariance,
    labelSpan: [0.05, 0.28],
  },
  {
    name: "DP Variance",
    color: qualityColors.dpVariance,
    value: (p) => p.dpVariance,
    labelSpan: [0.38, 0.62],
  },
  {
    name: "Aggregate Variance Trend",
    color: qualityColors.aggregateTrend,
    value: (p) => p.aggregateVariance,
    dashed: true,
    labelSpan: [0.72, 0.92],
  },
];

// Half a label's width, as a share of the plotted days — the window checked
// for lines the label could collide with.
const LABEL_HALF_WIDTH = 0.07;

interface LabelPlacement {
  x: number;
  y: number;
  above: boolean;
}

// Where to put a series' inline label: the spot in its stretch where the line
// is furthest out on the top (or bottom) edge of the whole bundle. The label
// is anchored at the highest (or lowest) value of *any* line across its width
// and drawn beyond it, so no line runs through the text. Null when the series
// has no values in its stretch.
const placeLabel = (points: QualityChartPoint[], s: SeriesSpec): LabelPlacement | null => {
  const n = points.length;
  if (n === 0) return null;
  const half = Math.max(1, Math.ceil(n * LABEL_HALF_WIDTH));
  const lo = Math.floor(s.labelSpan[0] * (n - 1));
  const hi = Math.max(lo, Math.floor(s.labelSpan[1] * (n - 1)));

  let best: (LabelPlacement & { score: number }) | null = null;
  for (let i = lo; i <= hi; i++) {
    const own = s.value(points[i]);
    if (own == null) continue;
    let top = -Infinity;
    let bottom = Infinity;
    let othersTop = -Infinity;
    let othersBottom = Infinity;
    for (let j = Math.max(0, i - half); j <= Math.min(n - 1, i + half); j++) {
      for (const o of SERIES) {
        const v = o.value(points[j]);
        if (v == null) continue;
        top = Math.max(top, v);
        bottom = Math.min(bottom, v);
        if (o !== s) {
          othersTop = Math.max(othersTop, v);
          othersBottom = Math.min(othersBottom, v);
        }
      }
    }
    // How clearly this line leads the others on each edge here.
    const candidates = [
      { score: own - othersTop, y: top, above: true },
      { score: othersBottom - own, y: bottom, above: false },
    ];
    for (const c of candidates) {
      if (!best || c.score > best.score) best = { x: i, ...c };
    }
  }
  return best ? { x: best.x, y: best.y, above: best.above } : null;
};

// "4700 (0)" — the measured value with its variance against plan, the variance
// green when on or below plan and red when the cargo came in above it.
const valueWithVariance = (value: number | null, variance: number | null) => {
  if (value == null) return "—";
  if (variance == null) return formatGcv(value);
  const color = variance < 0 ? brand.danger : brand.green;
  return `${formatGcv(value)} <span style="color:${color}">(${Math.round(variance)})</span>`;
};

const tooltipHtml = (p: QualityChartPoint) => {
  const row = (label: string, value: string) =>
    `<tr><td style="color:${brand.textMuted};padding:3px 32px 3px 0">${label}</td>` +
    `<td style="text-align:right;font-weight:600;color:${brand.black}">${value}</td></tr>`;
  return (
    `<div style="padding:4px 2px;font-size:13px">` +
    `<table style="border-collapse:collapse">` +
    `<tr style="border-bottom:1px solid ${brand.border}">` +
    `<td style="color:${brand.textMuted};padding:0 32px 6px 0">Date:</td>` +
    `<td style="text-align:right;font-weight:700;color:${brand.black};padding-bottom:6px">` +
    `${dayjs(p.date).format("MMM DD, YYYY")}</td></tr>` +
    row("Planned Value:", formatGcv(p.plannedValue)) +
    row("Value at Load Port:", valueWithVariance(p.loadPortValue, p.lpVariance)) +
    row("Value at Dispatch Port:", valueWithVariance(p.dischargePortValue, p.dpVariance)) +
    `</table></div>`
  );
};

// Daily LP / DP variance against plan as smooth lines, plus a dashed rolling
// trend of the two. A solid zero line marks "on plan"; the right axis mirrors
// the left. Drag across the plot to zoom into a stretch of days.
export const QualityVarianceChart = ({ data, loading }: Props) => {
  const { text: axisTitleColor, cardBg: labelBg } = useBrandTokens();
  const points = useMemo(() => data?.points ?? [], [data]);

  const options = useMemo<Highcharts.Options>(() => {
    const dense = points.length > MARKER_LIMIT;
    // Inline series labels (as in the Figma) ride on one invisible scatter
    // series, each anchored just beyond the bundle of lines at its spot. A
    // card-coloured halo keeps the text crisp over the grid.
    const labelPoints = SERIES.flatMap((s) => {
      const at = placeLabel(points, s);
      return at
        ? [
            {
              x: at.x,
              y: at.y,
              dataLabels: {
                format: s.name,
                verticalAlign: at.above ? ("bottom" as const) : ("top" as const),
                y: at.above ? -6 : 6,
                style: { color: s.color },
              },
            },
          ]
        : [];
    });
    return {
      chart: { type: "spline", height: 440, zooming: { type: "x" } },
      xAxis: {
        categories: points.map((p) => dayjs(p.date).format("MMM DD")),
        title: { text: "Timeperiod (Daily)", style: { color: axisTitleColor, fontSize: "13px" } },
        labels: { rotation: 0 },
        tickInterval: dense ? Math.ceil(points.length / 8) : 1,
        tickmarkPlacement: "on",
      },
      // An axis array replaces (not merges with) Chart's yAxis defaults, so
      // each axis restates the shared label style.
      yAxis: [
        {
          ...Y_AXIS_BASE,
          // Headroom above / below the lines for the inline labels.
          maxPadding: 0.12,
          minPadding: 0.12,
          gridLineColor: brand.border,
          gridLineDashStyle: "Dash",
          plotLines: [{ value: 0, color: qualityColors.zeroLine, width: 1.5, zIndex: 3 }],
        },
        { ...Y_AXIS_BASE, linkedTo: 0, opposite: true, gridLineWidth: 0 },
      ],
      legend: { enabled: true, align: "center", verticalAlign: "bottom", symbolRadius: 6 },
      tooltip: {
        shared: true,
        useHTML: true,
        padding: 12,
        shadow: true,
        formatter: function () {
          const ctx = this as unknown as { points?: { point?: { index?: number } }[] };
          const idx = ctx.points?.[0]?.point?.index;
          const p = idx != null ? points[idx] : undefined;
          return p ? tooltipHtml(p) : false;
        },
      },
      plotOptions: {
        spline: {
          lineWidth: 2,
          marker: { enabled: !dense, radius: 4, symbol: "circle" },
          states: { inactive: { opacity: 1 } },
        },
      },
      series: [
        ...SERIES.map((s) => ({
          type: "spline" as const,
          name: s.name,
          color: s.color,
          dashStyle: s.dashed ? ("Dash" as const) : ("Solid" as const),
          // The dashed trend never shows markers; the solid lines follow `dense`.
          marker: { enabled: !s.dashed && !dense },
          data: points.map((p) => s.value(p)),
        })),
        {
          type: "scatter" as const,
          name: "Series labels",
          showInLegend: false,
          enableMouseTracking: false,
          marker: { enabled: false },
          data: labelPoints,
          dataLabels: {
            enabled: true,
            allowOverlap: true,
            crop: false,
            overflow: "allow" as const,
            style: {
              fontSize: "12px",
              fontWeight: "600",
              textOutline: `3px ${labelBg}`,
            },
          },
        },
      ],
    };
  }, [points, axisTitleColor, labelBg]);

  if (!data) return <Skeleton active paragraph={{ rows: 9 }} />;
  if (points.length === 0) {
    return <Empty description="No quality readings for these filters" style={{ padding: 48 }} />;
  }

  return <Chart options={options} loading={loading} />;
};
