import { ArrowDownOutlined, ArrowUpOutlined } from "@ant-design/icons";
import { useBrandTokens } from "../../theme/useBrandTokens";

interface Props {
  /** Signed percentage — sign picks the arrow + color, magnitude is shown. */
  value: number;
  /** Trailing descriptor, e.g. "vs Budget". */
  label: string;
  /** Descriptor text color. Defaults to the secondary token; the KPI card
   *  passes white when its surface flips to the slice color on hover. */
  labelColor?: string;
}

// Small "▲12% vs Budget" delta indicator. The arrow + percent take the semantic
// up/down color so they stay legible on any surface; only the descriptor
// follows `labelColor`. Reused by the Segment Wise KPI cards and the donut.
export const DeltaStat = ({ value, label, labelColor }: Props) => {
  const t = useBrandTokens();
  const up = value >= 0;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12 }}>
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 2,
          fontWeight: 600,
          color: up ? t.deltaUp : t.deltaDown,
        }}
      >
        {up ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
        {Math.abs(value)}%
      </span>
      <span style={{ color: labelColor ?? t.textSecondary }}>{label}</span>
    </span>
  );
};
