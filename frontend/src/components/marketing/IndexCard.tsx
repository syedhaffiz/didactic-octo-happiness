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
import type { IndexChart, IndexRange } from "../../types/marketing";

// URL-safe slug so each card owns its own range param (e.g. "ici" →
// "range_ici") and the dropdowns never collide.
const paramKey = (code: string) =>
  `range_${code.toLowerCase().replace(/[^a-z0-9]/g, "")}`;

const cadenceLabel = (cadence: "daily" | "weekly") =>
  cadence === "daily" ? "Updates Daily" : "Updates Weekly";

// One independent Index Movement card. Renders its title + cadence subtitle in
// the card header, an independent 1/2 Month dropdown on the right, and a
// multi-series line chart in the body. The page passes the per-chart color
// palette so the lines match the figma legend exactly.
export const IndexCard = ({
  code,
  initial,
  colors,
}: {
  code: string;
  initial: IndexChart;
  colors: readonly string[];
}) => {
  const [rawRange, setRawRange] = useUrlParam(paramKey(code));
  const range: IndexRange = isIndexRange(rawRange) ? rawRange : DEFAULT_INDEX_RANGE;

  // Only refetch when the user picks a non-default range — the bulk call
  // already seeded this card's default-range data.
  const needsRefetch = isIndexRange(rawRange) && rawRange !== DEFAULT_INDEX_RANGE;
  const { data: fetched, isLoading } = useApi(
    ["marketing", "index", code, range, needsRefetch],
    () => (needsRefetch ? marketingApi.indexOne(code, range) : Promise.resolve(initial)),
  );
  const idx = fetched ?? initial;
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
      {series.length === 0 ? (
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
            loading={isLoading && needsRefetch}
          />
        </ErrorBoundary>
      )}
    </Card>
  );
};
