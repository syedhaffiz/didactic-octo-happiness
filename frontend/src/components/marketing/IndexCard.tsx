import { Card, Empty } from "antd";
import { ErrorBoundary } from "../ErrorBoundary";
import { marketingApi } from "../../api/marketing";
import { useApi } from "../../api/useApi";
import { useUrlParam } from "../../utils/useUrlParam";
import { brand } from "../../theme/tokens";
import { MultiSeriesLineChart } from "../MultiSeriesLineChart";
import {
  DEFAULT_INDEX_RANGE,
  IndexRangeSelect,
  isIndexRange,
} from "./IndexRangeSelect";
import type { IndexRange } from "../../types/marketing";

const paramKey = (code: string) =>
  `range_${code.toLowerCase().replace(/[^a-z0-9]/g, "")}`;

const cadenceLabel = (cadence: "daily" | "weekly") =>
  cadence === "daily" ? "Updates Daily" : "Updates Weekly";

export const IndexCard = ({
  code,
  colors,
}: {
  code: string;
  colors: readonly string[];
}) => {
  const [rawRange, setRawRange] = useUrlParam(paramKey(code));
  const range: IndexRange = isIndexRange(rawRange) ? rawRange : DEFAULT_INDEX_RANGE;

  const { data: idx, isLoading } = useApi(
    ["marketing", "index", code, range],
    () => marketingApi.indexOne(code, range),
  );
  const series = idx?.series ?? [];

  const onChange = (next: IndexRange) =>
    setRawRange(next === DEFAULT_INDEX_RANGE ? undefined : next);

  return (
    <Card
      title={
        <span style={{ display: "inline-flex", alignItems: "baseline", gap: 10 }}>
          <span style={{ fontWeight: 700, fontSize: 16 }}>{idx?.title ?? code}</span>
          <span style={{ color: brand.accent, fontSize: 13, fontWeight: 500 }}>
            {cadenceLabel(idx?.cadence ?? "weekly")}
          </span>
        </span>
      }
      extra={<IndexRangeSelect value={range} onChange={onChange} />}
      styles={{ header: { borderBottom: "none" }, body: { paddingTop: 4 } }}
    >
      {!isLoading && series.length === 0 ? (
        <Empty description="No series data" style={{ padding: 32 }} />
      ) : (
        <ErrorBoundary level="section" label={idx?.code ?? code}>
          <MultiSeriesLineChart
            categories={idx?.categories ?? []}
            series={series}
            colors={colors}
            height={340}
            yMin={0}
            valueDecimals={1}
            loading={isLoading}
          />
        </ErrorBoundary>
      )}
    </Card>
  );
};
