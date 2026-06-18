import { Col, Row } from "antd";
import { ErrorBoundary } from "../../components/ErrorBoundary";
import { ErrorRetry } from "../../components/ErrorRetry";
import { PageHeader } from "../../components/PageHeader";
import { DateRangeFilter } from "../../components/DateRangeFilter";
import { ForexCard } from "../../components/ForexCard";
import { KpiCardsGrid } from "../../components/finance/KpiCardsGrid";
import { financeApi } from "../../api/finance";
import { useApi } from "../../api/useApi";
import {
  formatDateRangePill,
  useDateRangeWithDefault,
} from "../../utils/useDateRangeWithDefault";

// Finance Overview — thin page container. Each section (KPI grid + Forex card)
// is wrapped in its own ErrorBoundary so a render exception in one doesn't
// blank the page, and each child component handles its own loading state via
// antd Card.loading + Highcharts.showLoading instead of swapping the layout
// for a Skeleton.
export const FinanceOverview = () => {
  const { start, end, value, fromDate, toDate, setRange } = useDateRangeWithDefault(1);

  const { data, isLoading, isError, error, refetch } = useApi(
    ["finance", "overview", fromDate, toDate],
    () => financeApi.overview({ fromDate, toDate }),
  );

  return (
    <>
      <PageHeader
        title="Finance"
        datePill={formatDateRangePill(start, end)}
        filters={<DateRangeFilter value={value} onChange={setRange} />}
      />

      {isError ? (
        <ErrorRetry title="Could not load overview" error={error} onRetry={refetch} />
      ) : (
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={16}>
            <ErrorBoundary level="section" label="KPI cards">
              <KpiCardsGrid kpis={data?.kpis} loading={isLoading} />
            </ErrorBoundary>
          </Col>
          <Col xs={24} lg={8}>
            <ErrorBoundary level="section" label="Forex Movement">
              <ForexCard />
            </ErrorBoundary>
          </Col>
        </Row>
      )}
    </>
  );
};
