import { Alert, Card, Col, Row, Select, Skeleton } from "antd";
import { Chart } from "../../components/Chart";
import { inventoryApi } from "../../api/inventory";
import { useApi } from "../../api/useApi";
import { useUrlParam } from "../../utils/useUrlParam";
import { brand } from "../../theme/tokens";
import { useBrandTokens } from "../../theme/useBrandTokens";
import type { IndexRange, PriceIndex } from "../../types/inventory";

const isRange = (v: string | undefined): v is IndexRange =>
  v === "1W" || v === "1M" || v === "3M" || v === "1Y";

const RANGE_OPTIONS: { value: IndexRange; label: string }[] = [
  { value: "1W", label: "1 Week" },
  { value: "1M", label: "1 Month" },
  { value: "3M", label: "3 Months" },
  { value: "1Y", label: "1 Year" },
];

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

const PriceIndexCard = ({
  idx,
  range,
  onRangeChange,
}: {
  idx: PriceIndex;
  range: IndexRange;
  onRangeChange: (r: IndexRange) => void;
}) => {
  const t = useBrandTokens();
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
          onChange={onRangeChange}
          options={RANGE_OPTIONS}
          style={{ width: 110 }}
        />
      }
      style={{ height: "100%" }}
      styles={{ header: { borderBottom: "none" }, body: { paddingTop: 4 } }}
    >
      <Chart options={indexChartOptions(idx)} />
      <div style={{ marginTop: 10, display: "flex", alignItems: "baseline", gap: 8 }}>
        <span style={{ fontSize: 22, fontWeight: 700, color: t.text }}>
          {idx.current.toFixed(2)}
        </span>
        <span style={{ color: t.deltaDown, fontSize: 12 }}>
          ({formatHeadlineDate(idx.currentDate)})
        </span>
      </div>
    </Card>
  );
};

export const IndexPage = () => {
  const [rawRange, setRawRange] = useUrlParam("range");
  const range: IndexRange = isRange(rawRange) ? rawRange : "1M";
  const setRange = (next: IndexRange) =>
    setRawRange(next === "1M" ? undefined : next);

  const { data, isLoading, isError, error, refetch } = useApi(
    ["inventory", "index", range],
    () => inventoryApi.index(range),
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

  return (
    <Row gutter={[16, 16]}>
      {(isLoading ? Array.from({ length: 3 }) : data?.items ?? []).map((idx, i) => (
        <Col xs={24} md={12} xl={8} key={idx ? (idx as PriceIndex).code : `s${i}`}>
          {isLoading || !idx ? (
            <Skeleton active paragraph={{ rows: 8 }} />
          ) : (
            <PriceIndexCard idx={idx as PriceIndex} range={range} onRangeChange={setRange} />
          )}
        </Col>
      ))}
    </Row>
  );
};
