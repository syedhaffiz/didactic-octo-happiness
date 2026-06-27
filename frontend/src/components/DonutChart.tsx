import { Chart } from "./Chart";
import type { DonutResponse } from "../types/finance";
import { donutColors } from "../theme/tokens";
import { useBrandTokens } from "../theme/useBrandTokens";
import { formatCrValue, formatRawWithCommas, splitCrValue } from "../utils/format";

const palette = donutColors;

export const DonutChart = ({ donut, height = 260 }: { donut: DonutResponse; height?: number }) => {
  const t = useBrandTokens();
  const totalParts = splitCrValue(donut.total);
  return (
    <div style={{ position: "relative" }}>
      <Chart
        options={{
          chart: { type: "pie", height },
          tooltip: {
            useHTML: true,
            formatter() {
              const key = String(this.key ?? "");
              const slice = donut.slices.find((s) => s.segment === key);
              const raw = slice ? formatRawWithCommas(slice.value, "Cr") : "";
              return `<b>${key}</b><br/>${slice?.pct ?? 0}% (${formatCrValue(Number(this.y))})<br/><span style="color:${t.textSecondary}">${raw}</span>`;
            },
          },
          plotOptions: {
            pie: {
              innerSize: "68%",
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
              data: donut.slices.map((s, idx) => ({
                name: s.segment,
                y: s.value,
                color: palette[idx % palette.length],
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
        <span style={{ fontSize: 22, fontWeight: 600, color: t.text }}>
          {totalParts.num}{" "}
          <span style={{ fontSize: 12, color: t.textSecondary }}>{totalParts.unit}</span>
        </span>
      </div>
    </div>
  );
};
