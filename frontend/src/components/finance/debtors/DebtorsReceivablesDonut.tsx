import { Chart } from "../../Chart";
import { useBrandTokens } from "../../../theme/useBrandTokens";
import { debtorsColors } from "../../../theme/tokens";
import { formatMoney, formatMoneyCompact } from "../../../utils/format";
import type { Currency, DebtorsBreakdownItem } from "../../../types/finance";

interface Props {
  items: DebtorsBreakdownItem[];
  netReceivable: number;
  totalDue: number;
  totalNotDue: number;
  currency: Currency;
  height?: number;
  /** Called when the centre "NET RECEIVABLES" label is activated. */
  onCenterClick: () => void;
}

const RING_HEIGHT = 240;

// Donut for the Debtors overview breakdown sections. Slices are sized by the
// magnitude of each entry's value (a donut can't render negative arcs, so the
// sign lives in the tooltip); the centre shows the true signed NET RECEIVABLES
// with its Due / Not-due split and is clickable — drilling into the unfiltered
// table. A custom two-column legend sits below (fully styled, non-interactive).
export const DebtorsReceivablesDonut = ({
  items,
  netReceivable,
  totalDue,
  totalNotDue,
  currency,
  height = RING_HEIGHT,
  onCenterClick,
}: Props) => {
  const t = useBrandTokens();
  const colorFor = (idx: number) => debtorsColors[idx % debtorsColors.length];

  if (items.length === 0) {
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
        No data
      </div>
    );
  }

  return (
    <div>
      <div style={{ position: "relative" }}>
        <Chart
          options={{
            chart: { type: "pie", height },
            tooltip: {
              useHTML: true,
              formatter() {
                const key = String(this.key ?? "");
                const item = items.find((s) => s.name === key);
                const amount = item ? formatMoney(item.value, currency) : "";
                return `<b>${key}</b><br/><span style="color:${t.textSecondary}">${amount}</span>`;
              },
            },
            plotOptions: {
              pie: {
                innerSize: "78%",
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
                name: "Receivables",
                data: items.map((s, idx) => ({
                  name: s.name,
                  // Magnitude drives the arc; the real signed value is in the tooltip.
                  y: Math.abs(s.value),
                  color: colorFor(idx),
                })),
              },
            ],
          }}
        />
        {/* Clickable centre — sits in the donut hole. */}
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
            role="button"
            tabIndex={0}
            onClick={onCenterClick}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onCenterClick();
              }
            }}
            title="View all debtors"
            style={{
              pointerEvents: "auto",
              cursor: "pointer",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 1,
            }}
          >
            <span style={{ fontSize: 10, letterSpacing: 0.5, color: t.textSecondary }}>
              NET RECEIVABLES
            </span>
            <span style={{ fontSize: 22, fontWeight: 700, color: t.headline, lineHeight: 1.25 }}>
              {formatMoneyCompact(netReceivable, currency)}
            </span>
            <span style={{ fontSize: 10, color: t.textSecondary }}>
              Due: {formatMoneyCompact(totalDue, currency)}
            </span>
            <span style={{ fontSize: 10, color: t.textSecondary }}>
              Not due: {formatMoneyCompact(totalNotDue, currency)}
            </span>
          </div>
        </div>
      </div>

      {/* Custom two-column legend. */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "6px 16px",
          marginTop: 12,
          padding: "0 8px",
        }}
      >
        {items.map((s, idx) => (
          <div key={s.name} style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
            <span
              aria-hidden
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: colorFor(idx),
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
              title={s.name}
            >
              {s.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
