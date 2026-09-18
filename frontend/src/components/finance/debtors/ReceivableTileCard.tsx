import { useState } from "react";
import { Tooltip } from "antd";
import { useBrandTokens } from "../../../theme/useBrandTokens";
import { brand } from "../../../theme/tokens";
import { formatMoney, formatMoneyCompact, toMoneyParts } from "../../../utils/format";
import type { Currency, DebtorsBreakdownItem } from "../../../types/finance";

interface Props {
  item: DebtorsBreakdownItem;
  currency: Currency;
  /** Called when the tile is activated — the page navigates to the filtered table. */
  onClick: (name: string) => void;
}

// A segment-/group-wise receivable tile: the name, the net receivable (red when
// negative, navy otherwise), a divider, then the Due / Not Due split. Clickable
// — activating it drills into the table filtered to this segment/group; hovering
// draws a brand-gradient border.
export const ReceivableTileCard = ({ item, currency, onClick }: Props) => {
  const t = useBrandTokens();
  const [hover, setHover] = useState(false);
  const { num, unit } = toMoneyParts(item.value, currency);
  const negative = item.value < 0;

  // A gradient border on hover, via the padding-box/border-box two-layer trick
  // (the padding layer matches the tile fill so only the 1px edge shows the
  // gradient). Off-hover it's a plain 1px token border.
  const borderStyle = hover
    ? {
        border: "1px solid transparent",
        background: `linear-gradient(${t.pageBg}, ${t.pageBg}) padding-box, ${brand.gradient} border-box`,
        boxShadow: "var(--ct-card-shadow)",
      }
    : { border: `1px solid ${t.border}`, background: t.pageBg };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick(item.name)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick(item.name);
        }
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      style={{
        borderRadius: 10,
        padding: "14px 16px",
        cursor: "pointer",
        height: "100%",
        transition: "box-shadow 0.15s ease",
        ...borderStyle,
      }}
    >
      <div
        style={{
          fontSize: 12,
          letterSpacing: 0.4,
          textTransform: "uppercase",
          color: t.textSecondary,
          marginBottom: 6,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
        title={item.name}
      >
        {item.name}
      </div>
      <Tooltip title={formatMoney(item.value, currency)}>
        <div
          style={{
            fontSize: 24,
            fontWeight: 700,
            lineHeight: 1.2,
            color: negative ? t.receivableNegative : t.receivablePositive,
            whiteSpace: "nowrap",
          }}
        >
          {num}
          {unit ? <span style={{ fontSize: 15, marginLeft: 3 }}>{unit}</span> : null}
        </div>
      </Tooltip>
      <div style={{ borderTop: `1px solid ${t.border}`, margin: "10px 0 8px" }} />
      <div style={{ fontSize: 12, color: t.textSecondary, lineHeight: 1.7 }}>
        <div>Due: {formatMoneyCompact(item.due, currency)}</div>
        <div>Not Due: {item.notDue === 0 ? "—" : formatMoneyCompact(item.notDue, currency)}</div>
      </div>
    </div>
  );
};
