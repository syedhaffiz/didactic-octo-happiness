import { Card, Col, Row, Skeleton } from "antd";
import { ErrorRetry } from "../../components/ErrorRetry";
import { BarChartOutlined } from "@ant-design/icons";
import { PageHeader } from "../../components/PageHeader";
import { Chart } from "../../components/Chart";
import { DateRangeFilter } from "../../components/DateRangeFilter";
import { financeApi } from "../../api/finance";
import { useApi } from "../../api/useApi";
import { useUrlDateRange } from "../../utils/useUrlParam";
import { chartSeries } from "../../theme/tokens";
import { useBrandTokens } from "../../theme/useBrandTokens";
import type { BudgetActualRow } from "../../types/finance";

const sectionTitle = (icon: React.ReactNode, text: string) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
    {icon} {text}
  </span>
);

const portwiseOptions = (rows: BudgetActualRow[]): Highcharts.Options => ({
  chart: { type: "bar", height: Math.max(360, rows.length * 38) },
  xAxis: { categories: rows.map((r) => r.category) },
  yAxis: { min: 0, title: { text: undefined } },
  legend: { enabled: true, align: "center", verticalAlign: "bottom" },
  tooltip: { shared: true, valueSuffix: " MMT" },
  plotOptions: {
    bar: { dataLabels: { enabled: true, format: "{y} MMT" }, groupPadding: 0.1, pointPadding: 0.05 },
  },
  series: [
    { type: "bar", name: "Budget", data: rows.map((r) => r.budget), color: chartSeries.budget },
    { type: "bar", name: "Actual", data: rows.map((r) => r.actual), color: chartSeries.actual },
  ],
});

const columnOptions = (
  rows: BudgetActualRow[],
  yTitle: string,
  actualColor: string = chartSeries.actual,
): Highcharts.Options => ({
  chart: { type: "column", height: 280 },
  xAxis: { categories: rows.map((r) => r.category) },
  yAxis: {
    min: 0,
    title: { text: yTitle, style: { fontSize: "11px" } },
    labels: { formatter() { return Math.round(Number(this.value) / 1000) + "k"; } },
  },
  legend: { enabled: true, align: "center", verticalAlign: "bottom" },
  tooltip: { shared: true, valueSuffix: " MT" },
  plotOptions: {
    column: { groupPadding: 0.12 },
  },
  series: [
    { type: "column", name: "Budget", data: rows.map((r) => r.budget), color: chartSeries.budget },
    { type: "column", name: "Actual", data: rows.map((r) => r.actual), color: actualColor },
  ],
});

export const Sales = () => {
  const t = useBrandTokens();
  const [range, setRange] = useUrlDateRange();
  const fromDate = range?.[0]?.format("YYYY-MM-DD");
  const toDate = range?.[1]?.format("YYYY-MM-DD");

  const { data, isLoading, isError, error, refetch } = useApi(
    ["sales", fromDate, toDate],
    () => financeApi.sales({ fromDate, toDate }),
  );

  return (
    <>
      <PageHeader
        title="Sales Overview"
        filters={<DateRangeFilter value={range} onChange={setRange} />}
      />

      {isError ? (
        <ErrorRetry title="Could not load sales data" error={error} onRetry={refetch} />
      ) : (
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card
              title={sectionTitle(<BarChartOutlined style={{ color: t.accentText }} />, "Portwise")}
              style={{ height: "100%" }}
            >
              {isLoading || !data ? (
                <Skeleton active paragraph={{ rows: 10 }} />
              ) : (
                <Chart options={portwiseOptions(data.portwise)} />
              )}
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Card
                  title={sectionTitle(
                    <BarChartOutlined style={{ color: t.accentText }} />,
                    "Zonewise",
                  )}
                >
                  {isLoading || !data ? (
                    <Skeleton active paragraph={{ rows: 6 }} />
                  ) : (
                    <Chart
                      options={columnOptions(
                        data.zonewise,
                        "1000 metric tons (MT)",
                        chartSeries.actualAlt,
                      )}
                    />
                  )}
                </Card>
              </Col>
              <Col span={24}>
                <Card
                  title={sectionTitle(
                    <BarChartOutlined style={{ color: t.accentText }} />,
                    "Segmentwise",
                  )}
                >
                  {isLoading || !data ? (
                    <Skeleton active paragraph={{ rows: 6 }} />
                  ) : (
                    <Chart options={columnOptions(data.segmentwise, "1000 metric tons (MT)")} />
                  )}
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>
      )}
    </>
  );
};
