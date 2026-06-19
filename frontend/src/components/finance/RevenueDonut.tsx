import { Chart } from "../Chart";
import { useBrandTokens } from "../../theme/useBrandTokens";
import { formatRawWithCommas } from "../../utils/format";
import type { DonutSlice } from "../../types/finance";

interface Props {
  slices: DonutSlice[];
  /** Colors keyed by segment name. Falls back to the chart palette when missing. */
  colorBySegment: Record<string, string>;
  total: number;
  height?: number;
}

// Thick donut for the Revenue Breakdown card. The Figma reads roughly 50%
// inner radius — distinctly chunkier than the Overview donut. Center total +
// legend below.
export const RevenueDonut = ({ slices, colorBySegment, total, height = 300 }: Props) => {
  const t = useBrandTokens();
  return (
    <div style={{ position: "relative" }}>
      <Chart
        options={{
          chart: { type: "pie", height },
          tooltip: {
            useHTML: true,
            formatter() {
              const key = String(this.key ?? "");
              const slice = slices.find((s) => s.segment === key);
              const raw = slice ? formatRawWithCommas(slice.value, "Cr") : "";
              return `<b>${key}</b><br/>${slice?.pct ?? 0}% (${this.y} Cr)<br/><span style="color:${t.textSecondary}">${raw}</span>`;
            },
          },
          plotOptions: {
            pie: {
              innerSize: "52%",
              dataLabels: { enabled: false },
              showInLegend: true,
              borderWidth: 0,
            },
          },
          legend: {
            enabled: true,
            align: "center",
            verticalAlign: "bottom",
            symbolRadius: 6,
          },
          series: [
            {
              type: "pie",
              name: "Segments",
              data: slices.map((s) => ({
                name: s.segment,
                y: s.value,
                color: colorBySegment[s.segment],
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
        <span style={{ fontSize: 12, color: t.textSecondary }}>Total</span>
        <span style={{ fontSize: 26, fontWeight: 700, color: t.text }}>
          {total} <span style={{ fontSize: 13, color: t.textSecondary }}>Cr</span>
        </span>
      </div>
    </div>
  );
};
