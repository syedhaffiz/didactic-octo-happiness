import { useMemo } from "react";
import type Highcharts from "highcharts";
import { Chart } from "../Chart";
import { useBrandTokens } from "../../theme/useBrandTokens";
import { formatCount, formatMt, formatMtFull, formatShare } from "./contractsFormat";

export interface DonutItem {
  name: string;
  count: number;
  quantityMt: number;
  color: string;
}

interface Props {
  items: DonutItem[];
  total: number;
  /** Optional caption under the total, e.g. the pending MT. */
  totalCaption?: string;
  height?: number;
  /** Legend columns (3 for statuses, 2 for ports — as in the Figma). */
  legendColumns?: number;
  /** When given, the centre total is a drill-in link. */
  onTotalClick?: () => void;
  totalClickTitle?: string;
}

const RING_HEIGHT = 260;

// Donut for the Contracts overview: slices sized by contract count, a centre
// "Total" (optionally clickable — it drills into the details table) and a
// custom legend with each bucket's share. Zero-count buckets are left out of
// the ring and the legend so they never draw an empty arc.
export const ContractsDonut = ({
  items,
  total,
  totalCaption,
  height = RING_HEIGHT,
  legendColumns = 3,
  onTotalClick,
  totalClickTitle = "View contract details",
}: Props) => {
  const t = useBrandTokens();
  const visible = useMemo(
    () => (items ?? []).filter((i) => Number.isFinite(i.count) && i.count > 0),
    [items],
  );

  const options = useMemo<Highcharts.Options>(
    () => ({
      chart: { type: "pie", height },
      tooltip: {
        useHTML: true,
        formatter() {
          const key = String(this.key ?? "");
          const item = visible.find((s) => s.name === key);
          if (!item) return false;
          return (
            `<b>${key}</b><br/>${formatCount(item.count)} contracts · ${formatShare(item.count, total)}` +
            `<br/><span style="color:${t.textSecondary}">${formatMtFull(item.quantityMt)}</span>`
          );
        },
      },
      plotOptions: {
        pie: {
          innerSize: "74%",
          size: "92%",
          dataLabels: { enabled: false },
          showInLegend: false,
          borderWidth: 0,
          states: { hover: { halo: { size: 4 } } },
        },
      },
      legend: { enabled: false },
      series: [
        {
          type: "pie",
          name: "Contracts",
          data: visible.map((s) => ({ name: s.name, y: s.count, color: s.color })),
        },
      ],
    }),
    [visible, total, height, t.textSecondary],
  );

  if (visible.length === 0) {
    return (
      <div
        style={{
          height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: t.textSecondary,
        }}
      >
        No contracts for these filters
      </div>
    );
  }

  const clickable = typeof onTotalClick === "function";

  return (
    <div>
      <div style={{ position: "relative" }}>
        <Chart options={options} />
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <div
            role={clickable ? "button" : undefined}
            tabIndex={clickable ? 0 : undefined}
            onClick={clickable ? onTotalClick : undefined}
            onKeyDown={
              clickable
                ? (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onTotalClick?.();
                    }
                  }
                : undefined
            }
            title={clickable ? totalClickTitle : undefined}
            style={{
              pointerEvents: clickable ? "auto" : "none",
              cursor: clickable ? "pointer" : "default",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              padding: 8,
              borderRadius: "50%",
            }}
          >
            <span style={{ fontSize: 13, color: t.textSecondary }}>Total</span>
            <span
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: t.headline,
                lineHeight: 1.15,
                textDecoration: clickable ? "underline dotted" : undefined,
                textUnderlineOffset: 6,
              }}
            >
              {formatCount(total)}
            </span>
            {totalCaption ? (
              <span style={{ fontSize: 12, color: t.textSecondary }}>{totalCaption}</span>
            ) : null}
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${Math.max(1, legendColumns)}, minmax(0, 1fr))`,
          gap: "8px 16px",
          marginTop: 12,
          padding: "0 8px",
        }}
      >
        {visible.map((s) => (
          <div key={s.name} style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
            <span
              aria-hidden
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: s.color,
                flex: "0 0 auto",
              }}
            />
            <span
              style={{
                fontSize: 12,
                color: t.text,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              title={`${s.name} · ${formatMt(s.quantityMt)}`}
            >
              {s.name} · {formatShare(s.count, total)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
