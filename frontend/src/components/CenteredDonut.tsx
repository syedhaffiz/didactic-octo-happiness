import { Empty } from "antd";
import { Chart } from "./Chart";
import { useBrandTokens } from "../theme/useBrandTokens";

const FALLBACK_COLOR = "#5B8FF9";

interface Slice {
  label: string;
  value: number;
  pct: number;
}

interface Props {
  slices?: Slice[];
  colors?: readonly string[];
  total?: number;
  unit?: string;
  height?: number;
}

// Reusable donut with a centred total label. Guards against missing slices.
export const CenteredDonut = ({ slices, colors, total, unit = "", height = 280 }: Props) => {
  const t = useBrandTokens();

  const safeSlices = (Array.isArray(slices) ? slices : []).filter(
    (s): s is Slice => Boolean(s) && typeof s.value === "number" && Number.isFinite(s.value),
  );
  const palette = colors && colors.length > 0 ? colors : [FALLBACK_COLOR];

  if (safeSlices.length === 0) {
    return <Empty description="No data" style={{ padding: 24 }} />;
  }

  return (
    <div style={{ position: "relative" }}>
      <Chart
        options={{
          chart: { type: "pie", height },
          tooltip: {
            useHTML: true,
            formatter(): string {
              const key = String((this as { key?: unknown }).key ?? "");
              const slice = safeSlices.find((s) => s.label === key);
              return `<b>${key}</b><br/>${slice?.pct ?? 0}% (${slice?.value ?? ""} ${unit})`;
            },
          },
          plotOptions: {
            pie: {
              innerSize: "70%",
              dataLabels: { enabled: false },
              showInLegend: true,
              borderWidth: 2,
              borderColor: t.cardBg,
            },
          },
          legend: {
            enabled: true,
            align: "center",
            verticalAlign: "bottom",
            symbolRadius: 6,
            itemStyle: { fontSize: "12px" },
          },
          series: [
            {
              type: "pie",
              name: "Share",
              data: safeSlices.map((s, i) => ({
                name: s.label ?? `Slice ${i + 1}`,
                y: s.value,
                color: palette[i % palette.length],
              })),
            },
          ],
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: height - 56,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
        }}
      >
        <span style={{ fontSize: 11, color: t.textSecondary }}>Total</span>
        <span style={{ fontSize: 20, fontWeight: 700, color: t.text }}>
          {total ?? 0}
          {unit}
        </span>
      </div>
    </div>
  );
};
