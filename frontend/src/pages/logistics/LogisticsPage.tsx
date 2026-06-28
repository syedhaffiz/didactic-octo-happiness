import { Col, Row } from "antd";
import { PageHeader } from "../../components/PageHeader";
import { DateRangeFilter } from "../../components/DateRangeFilter";
import { VesselSailedCard } from "../../components/logistics/VesselSailedCard";
import { HandlingRatesCard } from "../../components/logistics/HandlingRatesCard";
import { PortwisePdaCard } from "../../components/logistics/PortwisePdaCard";
import { DpHandlingOutstandingCard } from "../../components/logistics/DpHandlingOutstandingCard";
import {
  formatDateRangePill,
  useDateRangeWithDefault,
} from "../../utils/useDateRangeWithDefault";

// Thin orchestrator: each card owns its own API call, loading and error state.
// The shared date-range filter drives only the Vessel Sailed Out query.
export const LogisticsPage = () => {
  const { start, end, value, fromDate, toDate, setRange } = useDateRangeWithDefault(1);

  return (
    <>
      <PageHeader
        title="Logistics"
        datePill={formatDateRangePill(start, end)}
        filters={<DateRangeFilter value={value} onChange={setRange} />}
      />

      <Row gutter={[16, 16]} align="stretch">
        <Col xs={24}>
          <VesselSailedCard fromDate={fromDate} toDate={toDate} />
        </Col>
        <Col xs={24} lg={12}>
          <HandlingRatesCard />
        </Col>
        <Col xs={24} lg={12}>
          <PortwisePdaCard title="Portwise PDA" />
        </Col>
        <Col xs={24}>
          <DpHandlingOutstandingCard />
        </Col>
      </Row>
    </>
  );
};
