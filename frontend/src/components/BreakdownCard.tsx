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
    <Card hoverable styles={{ body: { padding: "20px 22px" } }}>
      <Tooltip title={formatRawWithCommas(value, "Cr")}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
          <span style={{ fontSize: 28, fontWeight: 700, color: t.breakdownValue }}>{value}</span>
          <span style={{ fontSize: 15, fontWeight: 600, color: t.breakdownValue }}>Cr</span>
        </div>
      </Tooltip>
      <div style={{ marginTop: 6, color: t.textSecondary, fontSize: 14 }}>{segment}</div>
    </Card>
  );
};
