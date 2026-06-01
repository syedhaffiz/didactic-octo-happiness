import { Alert, Card, Col, Empty, Row, Select, Skeleton } from "antd";
import { Chart } from "../../components/Chart";
import { ErrorBoundary } from "../../components/ErrorBoundary";
import { inventoryApi } from "../../api/inventory";
import { useApi } from "../../api/useApi";
import { useUrlParam } from "../../utils/useUrlParam";
import { brand } from "../../theme/tokens";
import { useBrandTokens } from "../../theme/useBrandTokens";
import type { IndexRange, PriceIndex } from "../../types/inventory";

const isRange = (v: string | undefined): v is IndexRange =>
  v === "1W" || v === "1M" || v === "3M" || v === "1Y";

const DEFAULT_RANGE: IndexRange = "1M";

const RANGE_OPTIONS: { value: IndexRange; label: string }[] = [
  { value: "1W", label: "1 Week" },
  { value: "1M", label: "1 Month" },
  { value: "3M", label: "3 Months" },
  { value: "1Y", label: "1 Year" },
];

// URL-safe slug for each card's range param. e.g. "ICI 4" → "ici4" → param key
// "range_ici4". Each card writes/reads its own slot so they never collide.
const slug = (code: string) => code.toLowerCase().replace(/[^a-z0-9]/g, "");
const paramKey = (code: string) => `range_${slug(code)}`;

const formatTick = (iso: string): string => {
  const d = new Date(iso + "T00:00:00Z");
  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = d.toLocaleString("en", { month: "short", timeZone: "UTC" });
  return `${day}-${month}`;
};

const formatHeadlineDate = (iso: string): string => {
  const d = new Date(iso + "T00:00:00Z");
  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = d.toLocaleString("en", { month: "short", timeZone: "UTC" });
  const year = String(d.getUTCFullYear()).slice(-2);
  return `${day} ${month} ${year}`;
};

const indexChartOptions = (idx: PriceIndex): Highcharts.Options => ({
  chart: { type: "line", height: 280, backgroundColor: "transparent" },
  xAxis: {
    categories: idx.series.map((p) => formatTick(p.date)),
    labels: { rotation: idx.series.length > 12 ? -45 : 0, style: { fontSize: "11px" } },
    tickInterval: idx.series.length > 20 ? Math.ceil(idx.series.length / 6) : 1,
  },
  yAxis: { title: { text: undefined }, gridLineDashStyle: "Dash" },
  legend: { enabled: false },
  tooltip: { valueDecimals: 2 },
  plotOptions: {
    line: { marker: { enabled: false }, lineWidth: 2.5 },
  },
  series: [
    {
      type: "line",
      name: idx.code,
      data: idx.series.map((p) => p.value),
      color: brand.accent,
    },
  ],
});

// One independent card. Owns its own URL param, its own fetch, its own
// dropdown state. The page renders one of these per index code.
const PriceIndexCard = ({
  code,
  initial,
}: {
  code: string;
  initial: PriceIndex;
}) => {
  const t = useBrandTokens();
  const [rawRange, setRawRange] = useUrlParam(paramKey(code));
  const range: IndexRange = isRange(rawRange) ? rawRange : DEFAULT_RANGE;

  // Only fetch when the user has actually picked a non-default range — the
  // bulk call already gave us the default-range data for this card.
  const needsRefetch = isRange(rawRange) && rawRange !== DEFAULT_RANGE;
  const { data: fetched, isLoading } = useApi(
    ["inventory", "index", code, range, needsRefetch],
    () => (needsRefetch ? inventoryApi.indexOne(code, range) : Promise.resolve(initial)),
  );
  const idx = fetched ?? initial;

  const setRange = (next: IndexRange) =>
    setRawRange(next === DEFAULT_RANGE ? undefined : next);

  return (
    <Card
      title={
        <span>
          <span style={{ fontWeight: 700, fontSize: 16 }}>{idx.code}</span>
          <span style={{ color: t.textSecondary, fontWeight: 400, marginLeft: 8 }}>
            (Updates {idx.cadence})
          </span>
        </span>
      }
      extra={
        <Select
          size="small"
          value={range}
          onChange={setRange}
          options={RANGE_OPTIONS}
          style={{ width: 110 }}
        />
      }
      style={{ height: "100%" }}
      styles={{ header: { borderBottom: "none" }, body: { paddingTop: 4 } }}
      loading={isLoading && needsRefetch}
    >
      {idx.series.length === 0 ? (
        <Empty description="No series data" style={{ padding: 32 }} />
      ) : (
        <>
          <Chart options={indexChartOptions(idx)} />
          <div style={{ marginTop: 10, display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontSize: 22, fontWeight: 700, color: t.text }}>
              {idx.current.toFixed(2)}
            </span>
            <span style={{ color: t.deltaDown, fontSize: 12 }}>
              ({formatHeadlineDate(idx.currentDate)})
            </span>
          </div>
        </>
      )}
    </Card>
  );
};

export const IndexPage = () => {
  // One bulk fetch up front to discover which cards exist and seed each with
  // its default-range data. Per-card refetches are layered on top.
  const { data, isLoading, isError, error, refetch } = useApi(
    ["inventory", "index", "bulk", DEFAULT_RANGE],
    () => inventoryApi.index(DEFAULT_RANGE),
  );

  if (isError) {
    return (
      <Alert
        type="error"
        showIcon
        message="Could not load indices"
        description={error instanceof Error ? error.message : "Unknown error"}
        action={<a onClick={() => refetch()} style={{ cursor: "pointer" }}>Retry</a>}
      />
    );
  }

  if (isLoading) {
    return (
      <Row gutter={[16, 16]}>
        {Array.from({ length: 3 }).map((_, i) => (
          <Col xs={24} md={12} xl={8} key={`s${i}`}>
            <Skeleton active paragraph={{ rows: 8 }} />
          </Col>
        ))}
      </Row>
    );
  }

  const items = data?.items ?? [];
  if (items.length === 0) {
    return <Card><Empty description="No indices available" /></Card>;
  }

  return (
    <Row gutter={[16, 16]}>
      {items.map((idx) => (
        <Col xs={24} md={12} xl={8} key={idx.code}>
          {/* Per-card boundary so one index crashing (bad series, chart
              option mismatch, etc.) doesn't take down the other two. */}
          <ErrorBoundary level="section" label={idx.code}>
            <PriceIndexCard code={idx.code} initial={idx} />
          </ErrorBoundary>
        </Col>
      ))}
    </Row>
  );
};
