import { useCallback } from "react";
import { Empty, Skeleton } from "antd";
import { ColumnChart } from "../../ColumnChart";
import { agingColors } from "../../../theme/tokens";
import type { AgingResponse } from "../../../types/finance";
import {
  agingAxisTitle,
  formatAgingCompact,
  formatAgingFull,
  isAgingEmpty,
} from "./agingFormat";

interface Props {
  data?: AgingResponse;
  loading: boolean;
}

// Aging chart — one steel-blue column per age bucket (total across origins),
// compact value labels on top and the full raw figure in the tooltip.
export const AgingBucketChart = ({ data, loading }: Props) => {
  const unit = data?.unit ?? "MT";
  const formatValue = useCallback((v: number) => formatAgingCompact(v, unit), [unit]);
  const formatTooltip = useCallback((v: number) => formatAgingFull(v, unit), [unit]);

  if (!data) return <Skeleton active paragraph={{ rows: 7 }} />;
  if (isAgingEmpty(data)) return <Empty description="No aging data for these filters" />;

  return (
    <ColumnChart
      rows={data.buckets.map((b) => ({ category: b.bucket, value: b.amount }))}
      color={agingColors.bucket}
      yTitle={agingAxisTitle(unit)}
      height={380}
      labelRotation={0}
      labelItalic={false}
      pointWidth={34}
      formatValue={formatValue}
      formatTooltip={formatTooltip}
      loading={loading}
    />
  );
};
