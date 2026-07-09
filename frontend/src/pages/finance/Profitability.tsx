import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Col, Row } from "antd";
import { ErrorBoundary } from "../../components/ErrorBoundary";
import { ErrorRetry } from "../../components/ErrorRetry";
import { PageHeader } from "../../components/PageHeader";
import { ProfitabilityFilters } from "../../components/finance/ProfitabilityFilters";
import { PortWiseProfitabilityCard } from "../../components/finance/PortWiseProfitabilityCard";
import { TotalProfitabilityCard } from "../../components/finance/TotalProfitabilityCard";
import { VesselWiseLinkCard } from "../../components/finance/VesselWiseLinkCard";
import { SegmentWiseProfitabilityCard } from "../../components/finance/SegmentWiseProfitabilityCard";
import { financeApi } from "../../api/finance";
import { useApi } from "../../api/useApi";
import { useUrlParam } from "../../utils/useUrlParam";
import { useDateRangeWithDefault } from "../../utils/useDateRangeWithDefault";
import type { Currency } from "../../types/finance";

// Net Margin Profitability page (child of /finance/overview). Layout:
//   ┌───────────────┐ ┌──────────────────────────────┐
//   │ Total         │ │ Segment Wise Profitability    │
//   │ Profitability │ │ (KPI tiles + donut)           │
//   ├───────────────┤ │                               │
//   │ Vessel Wise → │ │                               │
//   └───────────────┘ └──────────────────────────────┘
//   ┌──────────────────────────────────────────────────┐
//   │ Port Wise (Budget vs Actual columns)             │
//   └──────────────────────────────────────────────────┘
const isCurrency = (v: string | undefined): v is Currency => v === "INR" || v === "USD";

// Display scaling for the Port Wise chart: the response carries base-currency
// amounts (rupees / dollars) which we scale to Cr (INR) or M (USD).
const chartScale: Record<Currency, { divisor: number; unit: string }> = {
  INR: { divisor: 10_000_000, unit: "Cr" },
  USD: { divisor: 1_000_000, unit: "M" },
};

export const Profitability = () => {
  const [, setSearchParams] = useSearchParams();
  const [rawCurrency, setRawCurrency] = useUrlParam("currency");
  const currency: Currency = isCurrency(rawCurrency) ? rawCurrency : "INR";

  const [zone, setZone] = useUrlParam("zone");
  // Inherit the shared Finance range set on the Overview page.
  const { value: range, fromDate, toDate, setRange } = useDateRangeWithDefault(1, {
    persist: "inherit",
  });

  // "All" is sent to the API as the literal "all" (rather than an omitted param),
  // per the filter contract.
  const zoneParam = zone ?? "all";

  const { data, isLoading, isError, error, refetch } = useApi(
    ["finance", "net-margin-profitability", zoneParam, currency, fromDate, toDate],
    () => financeApi.netMarginProfitability({ zone: zoneParam, currency, fromDate, toDate }),
  );

  const { divisor, unit } = chartScale[currency];
  const portRows = useMemo(
    () =>
      (data?.portwise ?? []).map((r) => ({
        category: r.port,
        budget: r.budget / divisor,
        actual: r.actual / divisor,
      })),
    [data, divisor],
  );

  // Export to Excel — placeholder only; not wired up yet.
  const handleExport = () => {};

  // Clear every filter param in one atomic update (zone / currency / date range)
  // so the page reverts to its defaults. Separate setters would each read the
  // same pre-update URL and clobber one another.
  const resetAll = () => setSearchParams({}, { replace: true });

  return (
    <>
      <PageHeader
        title="Net Margin Profitability"
        filters={
          <ProfitabilityFilters
            zone={zone}
            dateValue={range}
            currency={currency}
            onZoneChange={setZone}
            onDateChange={setRange}
            onCurrencyChange={(c) => setRawCurrency(c === "INR" ? undefined : c)}
            onExport={handleExport}
            onReset={resetAll}
          />
        }
      />

      {isError ? (
        <ErrorRetry title="Could not load profitability" error={error} onRetry={refetch} />
      ) : (
        <>
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={7}>
              <Row gutter={[16, 16]}>
                <Col xs={24}>
                  <ErrorBoundary level="section" label="Total Profitability">
                    <TotalProfitabilityCard
                      total={data?.total}
                      loading={isLoading}
                      currency={currency}
                    />
                  </ErrorBoundary>
                </Col>
                <Col xs={24}>
                  <VesselWiseLinkCard to="/finance/overview/profitability/vessels" />
                </Col>
              </Row>
            </Col>
            <Col xs={24} lg={17}>
              <ErrorBoundary level="section" label="Segment Wise Profitability">
                <SegmentWiseProfitabilityCard
                  items={data?.segmentwise}
                  loading={isLoading}
                  currency={currency}
                />
              </ErrorBoundary>
            </Col>
          </Row>

          <div style={{ marginTop: 16 }}>
            <ErrorBoundary level="section" label="Port Wise Profitability" resetKeys={[zoneParam, currency]}>
              <PortWiseProfitabilityCard rows={portRows} unit={unit} loading={isLoading} />
            </ErrorBoundary>
          </div>
        </>
      )}
    </>
  );
};
