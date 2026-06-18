import { Card } from "antd";
import { AimOutlined } from "@ant-design/icons";
import { TreemapChart } from "../TreemapChart";
import { useBrandTokens } from "../../theme/useBrandTokens";
import type { SegmentSlice } from "../../types/finance";

// Shades of blue keyed to the Figma's treemap palette (SNS = darkest, then
// SEB / Sagarmala / TPH / Old in successively lighter tones).
const SEGMENT_PALETTE = [
  "#1E5BB8",
  "#3C7BD7",
  "#5FA0E6",
  "#7FB6EE",
  "#A0CBF4",
] as const;

interface Props {
  slices?: SegmentSlice[];
  loading: boolean;
}

export const SegmentWiseTreemapCard = ({ slices, loading }: Props) => {
  const t = useBrandTokens();
  return (
    <Card
      title={
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <AimOutlined style={{ color: t.accentText }} /> Segment Wise Profitability
        </span>
      }
    >
      <TreemapChart
        slices={slices?.map((s) => ({ name: s.segment, value: s.value }))}
        palette={SEGMENT_PALETTE}
        loading={loading}
      />
    </Card>
  );
};
