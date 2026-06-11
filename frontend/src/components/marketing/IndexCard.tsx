import { Card, Empty } from "antd";
import { ErrorBoundary } from "../ErrorBoundary";
import { marketingApi } from "../../api/marketing";
import { useApi } from "../../api/useApi";
import { useUrlParam } from "../../utils/useUrlParam";
import { marketingColors } from "../../theme/tokens";
import { MultiSeriesLineChart } from "../MultiSeriesLineChart";
import { RangeSelect, DEFAULT_RANGE, isRange } from "../RangeSelect";
import type { IndexChart, MarketRange } from "../../types/marketing";

// URL-safe slug so each card owns its own range param (e.g. "ICI Index" →
// "range_iciindex") and the dropdowns never collide.
const slug = (code: string) => code.toLowerCase().replace(/[^a-z0-9]/g, "");
const paramKey = (code: string) => `range_${slug(code)}`;

// One independent Index Movement card (ICI Index / API Index). Owns its own URL
// range param and per-card refetch.
export const IndexCard = ({ code, initial }: { code: string; initial: IndexChart }) => {
  const [rawRange, setRawRange] = useUrlParam(paramKey(code));
  const range: MarketRange = isRange(rawRange) ? rawRange : DEFAULT_RANGE;

  // Only refetch when the user picks a non-default range — the bulk call
  // already seeded this card's default-range data.
  const needsRefetch = isRange(rawRange) && rawRange !== DEFAULT_RANGE;
  const { data: fetched, isLoading } = useApi(
    ["marketing", "index", code, range, needsRefetch],
    () => (needsRefetch ? marketingApi.indexOne(code, range) : Promise.resolve(initial)),
  );
  const idx = fetched ?? initial;
  const series = idx?.series ?? [];

  const onChange = (next: MarketRange) =>
    setRawRange(next === DEFAULT_RANGE ? undefined : next);

  return (
    <Card
      title={<span style={{ fontWeight: 700, fontSize: 16 }}>{idx?.code ?? code}</span>}
      extra={<RangeSelect value={range} onChange={onChange} />}
      styles={{ header: { borderBottom: "none" }, body: { paddingTop: 4 } }}
      loading={isLoading && needsRefetch}
    >
      {series.length === 0 ? (
        <Empty description="No series data" style={{ padding: 32 }} />
      ) : (
        <ErrorBoundary level="section" label={idx?.code ?? code}>
          <MultiSeriesLineChart
            categories={idx?.categories ?? []}
            series={series}
            colors={marketingColors.lineSeries}
            height={340}
            yMin={0}
            valueDecimals={1}
          />
        </ErrorBoundary>
      )}
    </Card>
  );
};
