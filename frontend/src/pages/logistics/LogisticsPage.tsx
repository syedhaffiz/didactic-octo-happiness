import { Col, Row } from "antd";
import { PageHeader } from "../../components/PageHeader";
import { DateRangeFilter } from "../../components/DateRangeFilter";
import { ErrorRetry } from "../../components/ErrorRetry";
import { VesselSailedCard } from "../../components/logistics/VesselSailedCard";
import { HandlingRatesCard } from "../../components/logistics/HandlingRatesCard";
import { PortwisePdaCard } from "../../components/logistics/PortwisePdaCard";
import { DpHandlingOutstandingCard } from "../../components/logistics/DpHandlingOutstandingCard";
import { logisticsApi } from "../../api/logistics";
import { useApi } from "../../api/useApi";
import {
  formatDateRangePill,
  useDateRangeWithDefault,
} from "../../utils/useDateRangeWithDefault";

export const LogisticsPage = () => {
  const { start, end, value, fromDate, toDate, setRange } = useDateRangeWithDefault(1);

  const { data, isLoading, isError, error, refetch } = useApi(
    ["logistics", "overview", fromDate, toDate],
    () => logisticsApi.overview({ fromDate, toDate }),
  );

  return (
    <>
      <PageHeader
        title="Logistics"
        datePill={formatDateRangePill(start, end)}
        filters={<DateRangeFilter value={value} onChange={setRange} />}
      />

      {isError ? (
        <ErrorRetry title="Could not load logistics" error={error} onRetry={refetch} />
      ) : (
        <Row gutter={[16, 16]}>
          <Col xs={24}>
            <VesselSailedCard rows={data?.vesselsSailed} loading={isLoading} />
          </Col>
          <Col xs={24} lg={12}>
            <HandlingRatesCard rows={data?.handlingRates} loading={isLoading} />
          </Col>
          <Col xs={24} lg={12}>
            <PortwisePdaCard title="Portwise PDA" root={data?.pda} loading={isLoading} />
          </Col>
          <Col xs={24}>
            <DpHandlingOutstandingCard data={data?.outstanding} loading={isLoading} />
          </Col>
        </Row>
      )}
    </>
  );
};
