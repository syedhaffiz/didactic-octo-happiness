import { Col, Row, Skeleton } from "antd";
import { ErrorRetry } from "../../components/ErrorRetry";
import { PageHeader } from "../../components/PageHeader";
import { KpiCard } from "../../components/KpiCard";
import { ForexCard } from "../../components/ForexCard";
import { DateRangeFilter } from "../../components/DateRangeFilter";
import { useUrlDateRange } from "../../utils/useUrlParam";
import { financeApi } from "../../api/finance";
import { useApi } from "../../api/useApi";

const subtitleFor = (range: ReturnType<typeof useUrlDateRange>[0]): string => {
  if (range && range[0] && range[1]) {
    return `${range[0].format("DD MMM YY")} – ${range[1].format("DD MMM YY")}`;
  }
  return "Apr 25 – Feb 26";
};

export const FinanceOverview = () => {
  const [range, setRange, dateRange] = useUrlDateRange();

  const { data, isLoading, isError, error, refetch } = useApi(
    ["overview", dateRange],
    () => financeApi.overview({ dateRange }),
  );

  return (
    <>
      <PageHeader
        title="Finance"
        datePill={subtitleFor(range)}
        filters={<DateRangeFilter value={range} onChange={setRange} />}
      />

      {isError ? (
        <ErrorRetry title="Could not load overview" error={error} onRetry={refetch} />
      ) : (
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={16}>
            <Row gutter={[16, 16]}>
              {(isLoading ? Array.from({ length: 6 }) : data?.kpis ?? []).map((kpi, idx) => (
                <Col xs={24} sm={12} md={8} key={kpi ? (kpi as { id: string }).id : `s${idx}`}>
                  {isLoading || !kpi ? (
                    <Skeleton active paragraph={{ rows: 3 }} />
                  ) : (
                    <KpiCard kpi={kpi as Parameters<typeof KpiCard>[0]["kpi"]} />
                  )}
                </Col>
              ))}
            </Row>
          </Col>
          <Col xs={24} lg={8}>
            <ForexCard />
          </Col>
        </Row>
      )}
    </>
  );
};
