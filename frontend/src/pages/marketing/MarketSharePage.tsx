import { Col, Row } from "antd";
import { PageHeader } from "../../components/PageHeader";
import { DateRangeFilter } from "../../components/DateRangeFilter";
import { ErrorRetry } from "../../components/ErrorRetry";
import { DrilldownPieCard } from "../../components/marketing/DrilldownPieCard";
import { ShipperReceiverCard } from "../../components/marketing/ShipperReceiverCard";
import { marketingApi } from "../../api/marketing";
import { useApi } from "../../api/useApi";
import {
  formatDateRangePill,
  useDateRangeWithDefault,
} from "../../utils/useDateRangeWithDefault";

export const MarketSharePage = () => {
  const { start, end, value, fromDate, toDate, setRange } = useDateRangeWithDefault(1);

  const { data, isLoading, isError, error, refetch } = useApi(
    ["marketing", "market-share", fromDate, toDate],
    () => marketingApi.marketShare({ fromDate, toDate }),
  );

  return (
    <>
      <PageHeader
        title="Market Share"
        datePill={formatDateRangePill(start, end)}
        filters={<DateRangeFilter value={value} onChange={setRange} />}
      />

      {isError ? (
        <ErrorRetry title="Could not load market share" error={error} onRetry={refetch} />
      ) : (
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            {/* Chart 1 — Geographic dominance: Market -> Zone -> Port */}
            <DrilldownPieCard
              title="Market Share"
              subtitle="Click a slice to drill down: Market → Zone → Port"
              dim="geographic"
              root={data?.geographic}
              loading={isLoading}
            />
          </Col>
          <Col xs={24} lg={12}>
            {/* Chart 2 — Commercial model: Market -> Port -> Business Type */}
            <DrilldownPieCard
              title="Market Share by Business Type"
              subtitle="Click a slice to drill down: Market → Port → Business Type"
              dim="businessType"
              root={data?.businessType}
              loading={isLoading}
            />
          </Col>
          <Col xs={24}>
            {/* Chart 3 — Operational balance: Shipper vs Receiver per port */}
            <ShipperReceiverCard
              title="Market Share by Receiver vs Shipper"
              rows={data?.shipperReceiver}
              loading={isLoading}
            />
          </Col>
        </Row>
      )}
    </>
  );
};
