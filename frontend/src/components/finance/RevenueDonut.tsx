import { Chart } from "../Chart";
import { useBrandTokens } from "../../theme/useBrandTokens";
import { formatMoney, toMoneyParts } from "../../utils/format";
import type { Currency, RevenueBreakdownItem } from "../../types/finance";

interface Props {
  /** Combined breakdown entries — same source as the KPI cards. */
  items: RevenueBreakdownItem[];
  /** Colors keyed by segment name. Falls back to the chart palette when missing. */
  colorBySegment: Record<string, string>;
  /** Whole-number total in the response currency's base unit. */
  total: number;
  currency: Currency;
  height?: number;
}

// Thick donut for the Revenue Breakdown card. The Figma reads roughly 50%
// inner radius — distinctly chunkier than the Overview donut. Center total +
// legend below.
export const RevenueDonut = ({ items, colorBySegment, total, currency, height = 300 }: Props) => {
  const t = useBrandTokens();
  const totalParts = toMoneyParts(total, currency);
  return (
    <div style={{ position: "relative" }}>
      <Chart
        options={{
          chart: { type: "pie", height },
          tooltip: {
            useHTML: true,
            formatter() {
              const key = String(this.key ?? "");
              const item = items.find((s) => s.segment === key);
              const amount = item ? formatMoney(item.value, currency) : "";
              return `<b>${key}</b><br/>${item?.pct ?? 0}%<br/><span style="color:${t.textSecondary}">${amount}</span>`;
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
              data: items.map((s) => ({
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
          {totalParts.num}{" "}
          <span style={{ fontSize: 13, color: t.textSecondary }}>{totalParts.unit}</span>
        </span>
      </div>
    </div>
  );
};
