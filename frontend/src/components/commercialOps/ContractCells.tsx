import type { CSSProperties, ReactNode } from "react";
import { Tooltip } from "antd";
import { brand } from "../../theme/tokens";
import { DASH, formatAmount } from "./contractsFormat";

// The Figma packs two fields into every column — a primary value with a muted
// secondary value beneath it (header and cell alike). These helpers render that
// stacked shape; every value goes through a null-safe formatter.

export const HeadPair = ({ top, bottom }: { top: string; bottom: string }) => (
  <div style={{ lineHeight: 1.35 }}>
    <div>{top}</div>
    <div style={{ fontSize: 11, fontWeight: 400, color: brand.textMuted }}>{bottom}</div>
  </div>
);

export const CellPair = ({
  top,
  bottom,
  topStyle,
  bottomTitle,
}: {
  top: ReactNode;
  bottom: ReactNode;
  topStyle?: CSSProperties;
  bottomTitle?: string;
}) => (
  <div style={{ lineHeight: 1.45 }}>
    <div style={topStyle}>{top}</div>
    <div style={{ fontSize: 12, color: brand.textMuted, marginTop: 4 }} title={bottomTitle}>
      {bottom}
    </div>
  </div>
);

// Signed amount — negative mark-to-market reads red; full figure on hover.
export const Amount = ({ value }: { value: number | null | undefined }) => {
  const text = formatAmount(value);
  if (text === DASH) return <>{DASH}</>;
  return (
    <Tooltip title={`₹ ${text}`}>
      <span style={(value ?? 0) < 0 ? { color: brand.danger } : undefined}>{text}</span>
    </Tooltip>
  );
};
