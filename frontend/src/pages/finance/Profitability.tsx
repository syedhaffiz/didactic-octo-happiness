import { Col, Row } from "antd";
import { ErrorBoundary } from "../../components/ErrorBoundary";
import { ErrorRetry } from "../../components/ErrorRetry";
import { PageHeader } from "../../components/PageHeader";
import { DateRangeFilter } from "../../components/DateRangeFilter";
import { PortFilter } from "../../components/filters/PortFilter";
import { PortWiseProfitabilityCard } from "../../components/finance/PortWiseProfitabilityCard";
import { TotalProfitabilityCard } from "../../components/finance/TotalProfitabilityCard";
import { VesselWiseLinkCard } from "../../components/finance/VesselWiseLinkCard";
import { SegmentWiseTreemapCard } from "../../components/finance/SegmentWiseTreemapCard";
import { financeApi } from "../../api/finance";
import { useApi } from "../../api/useApi";
import { useUrlParam } from "../../utils/useUrlParam";
import { useDateRangeWithDefault } from "../../utils/useDateRangeWithDefault";
import type { Currency } from "../../types/finance";

// Net Margin Profitability page (child of /finance/overview). Layout:
//   ┌───────────────────────┐ ┌─────────────┐ ┌──────────────┐
//   │  Port Wise            │ │ Total       │ │ Vessel Wise  │
//   │  Profitability        │ │ Profitabil. │ │ → link       │
//   │  (horizontal bars)    │ ├─────────────┴─┴──────────────┤
//   │                       │ │ Segment Wise Profitability   │
//   │                       │ │ (treemap)                    │
//   └───────────────────────┘ └──────────────────────────────┘
const isCurrency = (v: string | undefined): v is Currency => v === "INR" || v === "USD";

export const Profitability = () => {
  const [rawCurrency, setRawCurrency] = useUrlParam("currency");
  const currency: Currency = isCurrency(rawCurrency) ? rawCurrency : "INR";

  const [port, setPort] = useUrlParam("port");
  // Inherit the shared Finance range set on the Overview page.
  const { value: range, fromDate, toDate, setRange } = useDateRangeWithDefault(1, {
    persist: "inherit",
  });

  const { data, isLoading, isError, error, refetch } = useApi(
    ["finance", "net-margin-profitability", port, currency, fromDate, toDate],
    () => financeApi.netMarginProfitability({ port, currency, fromDate, toDate }),
  );

  return (
    <>
      <PageHeader
        title="Net Margin Profitability"
        filters={
          <>
            <PortFilter value={port} onChange={setPort} />
            <DateRangeFilter value={range} onChange={setRange} />
          </>
        }
      />

      {isError ? (
        <ErrorRetry title="Could not load profitability" error={error} onRetry={refetch} />
      ) : (
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={14}>
            <ErrorBoundary level="section" label="Port Wise Profitability">
              <PortWiseProfitabilityCard
                data={data?.portwise}
                loading={isLoading}
                currency={currency}
                onCurrencyChange={(c) => setRawCurrency(c === "INR" ? undefined : c)}
              />
            </ErrorBoundary>
          </Col>
          <Col xs={24} lg={10}>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={14}>
                <ErrorBoundary level="section" label="Total Profitability">
                  <TotalProfitabilityCard total={data?.total} loading={isLoading} />
                </ErrorBoundary>
              </Col>
              <Col xs={24} sm={10}>
                <VesselWiseLinkCard to="/finance/overview/profitability/vessels" />
              </Col>
              <Col xs={24}>
                <ErrorBoundary level="section" label="Segment Wise Profitability">
                  <SegmentWiseTreemapCard slices={data?.segmentwise} loading={isLoading} />
                </ErrorBoundary>
              </Col>
            </Row>
          </Col>
        </Row>
      )}
    </>
  );
};
