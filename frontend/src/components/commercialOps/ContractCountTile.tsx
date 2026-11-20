import { useState } from "react";
import { Tooltip } from "antd";
import { useBrandTokens } from "../../theme/useBrandTokens";
import { formatCount, formatMt, formatMtFull } from "./contractsFormat";

interface Props {
  label: string;
  count: number | null | undefined;
  quantityMt: number | null | undefined;
  /** Legend colour for this bucket — shown as a small dot beside the label. */
  color?: string;
  /** When given, the tile is a drill-in link to the filtered details table. */
  onClick?: () => void;
}

// A contract bucket tile (status or port): label, count and total MT. Mirrors
// the Debtors receivable tile — a tinted surface that gains an accent border
// on hover/focus when it is clickable.
export const ContractCountTile = ({ label, count, quantityMt, color, onClick }: Props) => {
  const t = useBrandTokens();
  const [hover, setHover] = useState(false);
  const clickable = typeof onClick === "function";
  const active = clickable && hover;

  const activate = () => onClick?.();

  return (
    <div
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={clickable ? activate : undefined}
      onKeyDown={
        clickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                activate();
              }
            }
          : undefined
      }
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      title={clickable ? `View ${label} contracts` : undefined}
      style={{
        height: "100%",
        borderRadius: 10,
        padding: "14px 16px",
        background: t.pageBg,
        border: `1px solid ${active ? t.accentText : "transparent"}`,
        boxShadow: active ? "var(--ct-card-shadow)" : undefined,
        cursor: clickable ? "pointer" : "default",
        transition: "border-color 0.15s ease, box-shadow 0.15s ease",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontSize: 12,
          color: t.textSecondary,
          marginBottom: 6,
          minWidth: 0,
        }}
      >
        {color ? (
          <span
            aria-hidden
            style={{ width: 8, height: 8, borderRadius: "50%", background: color, flex: "0 0 auto" }}
          />
        ) : null}
        <span
          style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
          title={label}
        >
          {label}
        </span>
      </div>
      <div style={{ fontSize: 26, fontWeight: 700, lineHeight: 1.2, color: t.headline }}>
        {formatCount(count)}
      </div>
      <Tooltip title={formatMtFull(quantityMt)}>
        <div style={{ marginTop: 6, fontSize: 12, color: t.textSecondary, display: "inline-block" }}>
          {formatMt(quantityMt)}
        </div>
      </Tooltip>
    </div>
  );
};
