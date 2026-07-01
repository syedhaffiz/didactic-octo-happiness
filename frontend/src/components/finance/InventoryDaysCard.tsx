import { Card, Empty } from "antd";
import { PieChartOutlined } from "@ant-design/icons";
import { Chart } from "../Chart";
import { CardTitle } from "../CardTitle";
import { inventoryColors } from "../../theme/tokens";
import { useBrandTokens } from "../../theme/useBrandTokens";
import type { InventoryGauge, InventorySlice } from "../../types/finance";

interface Props {
  gauge?: InventoryGauge;
  loading: boolean;
}

// Ring color by position in the response, cycling through the palette.
const ringColor = (i: number) => inventoryColors[i % inventoryColors.length];

// Concentric ring radii for `n` rings — the first slice is the outermost. Rings
// hug the outer edge (step capped so 1–2 rings stay thin like the original
// design) and step inward, shrinking to fit when there are many.
const OUTER = 92;
const CENTER_FLOOR = 6;
const ringRadii = (n: number) => {
  const step = Math.min(20, (OUTER - CENTER_FLOOR) / Math.max(n, 1));
  const thickness = step * 0.75;
  return Array.from({ length: n }, (_, i) => {
    const outer = OUTER - i * step;
    return { outer: `${outer}%`, inner: `${outer - thickness}%` };
  });
};

// Day ticks around the dial (0, 05, … max); single digits are zero-padded.
const padTick = (v: number) => (v > 0 && v < 10 ? `0${v}` : `${v}`);
const gaugeTicks = (max: number) => {
  const stepGuess = Math.max(1, Math.round(max / 7));
  const out: number[] = [];
  for (let v = 0; v <= max; v += stepGuess) out.push(v);
  return out;
};

const gaugeOptions = (
  slices: InventorySlice[],
  max: number,
  radii: { outer: string; inner: string }[],
  tokens: { textSecondary: string; border: string },
): Highcharts.Options => ({
  chart: { type: "solidgauge", height: 280, backgroundColor: "transparent" },
  title: { text: undefined },
  tooltip: {
    borderWidth: 0,
    backgroundColor: "transparent",
    shadow: false,
    useHTML: true,
    headerFormat: "",
    pointFormat:
      `<span style="color:{point.color};font-size:12px;font-weight:600">` +
      `{series.name}: {point.y} days</span>`,
  },
  pane: {
    size: "82%",
    // ~315° dial with a gap at the top so the 0 and max ticks don't collide.
    startAngle: 0,
    endAngle: 315,
    background: radii.map((r) => ({
      outerRadius: r.outer,
      innerRadius: r.inner,
      backgroundColor: tokens.border,
      borderWidth: 0,
    })),
  },
  yAxis: {
    min: 0,
    max,
    lineWidth: 0,
    tickWidth: 0,
    minorTickWidth: 0,
    tickPositions: gaugeTicks(max),
    labels: {
      enabled: true,
      distance: 14,
      style: { fontSize: "10px", color: tokens.textSecondary },
      formatter() {
        return padTick(Number(this.value));
      },
    },
  },
  plotOptions: { solidgauge: { dataLabels: { enabled: false }, rounded: true } },
  // Highcharts' solidgauge legend swatch ignores the series color (renders
  // grey), so the legend is drawn in React below the chart instead.
  legend: { enabled: false },
  series: slices.map((s, i) => {
    const color = ringColor(i);
    return {
      type: "solidgauge",
      name: s.segment,
      color,
      data: [{ y: s.days, color, radius: radii[i].outer, innerRadius: radii[i].inner }],
    } as unknown as Highcharts.SeriesOptionsType;
  }),
});

// Custom legend (see note in gaugeOptions on why the built-in one isn't used).
// One item per ring, in the same order/colors as the series.
const GaugeLegend = ({ slices, color }: { slices: InventorySlice[]; color: string }) => (
  <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 20, marginTop: 4 }}>
    {slices.map((s, i) => (
      <span
        key={s.segment}
        style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color }}
      >
        <span
          style={{
            width: 11,
            height: 11,
            borderRadius: "50%",
            display: "inline-block",
            background: ringColor(i),
          }}
        />
        {s.segment}
      </span>
    ))}
  </div>
);

export const InventoryDaysCard = ({ gauge, loading }: Props) => {
  const t = useBrandTokens();
  const slices = gauge?.slices ?? [];
  const empty = !loading && slices.length === 0;
  const radii = ringRadii(slices.length);

  return (
    <Card title={<CardTitle icon={<PieChartOutlined />}>Inventory Days</CardTitle>}>
      {empty ? (
        <Empty description="No inventory data" />
      ) : (
        <>
          <Chart
            loading={loading}
            options={gaugeOptions(slices, gauge?.max ?? 35, radii, {
              textSecondary: t.textSecondary,
              border: t.border,
            })}
          />
          <GaugeLegend slices={slices} color={t.text} />
        </>
      )}
    </Card>
  );
};
