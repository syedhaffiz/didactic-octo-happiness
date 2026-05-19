import { Card, Tooltip } from "antd";
import { useBrandTokens } from "../theme/useBrandTokens";
import { formatRawWithCommas } from "../utils/format";

interface BreakdownCardProps {
  segment: string;
  value: number;
}

export const BreakdownCard = ({ segment, value }: BreakdownCardProps) => {
  const t = useBrandTokens();
  return (
    <Card hoverable styles={{ body: { padding: 18 } }}>
      <Tooltip title={formatRawWithCommas(value, "Cr")}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
          <span style={{ fontSize: 26, fontWeight: 600, color: t.text }}>{value}</span>
          <span style={{ fontSize: 13, color: t.textSecondary }}>Cr</span>
        </div>
      </Tooltip>
      <div style={{ marginTop: 4, color: t.textSecondary, fontSize: 13 }}>{segment}</div>
    </Card>
  );
};
