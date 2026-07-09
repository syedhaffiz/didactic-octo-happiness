import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, Col, Row, Skeleton } from "antd";
import { BarChartOutlined, PieChartOutlined } from "@ant-design/icons";
import { ErrorBoundary } from "../../components/ErrorBoundary";
import { ErrorRetry } from "../../components/ErrorRetry";
import { PageHeader } from "../../components/PageHeader";
import { CardTitle } from "../../components/CardTitle";
import { RevenueDonut } from "../../components/finance/RevenueDonut";
import { RevenueKpiCard } from "../../components/finance/RevenueKpiCard";
import { RevenueFilters } from "../../components/finance/RevenueFilters";
import { DeltaStat } from "../../components/finance/DeltaStat";
import { BudgetActualColumnChart } from "../../components/finance/BudgetActualColumnChart";
import { financeApi } from "../../api/finance";
import { useApi } from "../../api/useApi";
import { useBrandTokens } from "../../theme/useBrandTokens";
import { donutColors } from "../../theme/tokens";
import { useUrlParams } from "../../utils/useUrlParam";
import {
  formatDateRangePill,
  useDateRangeWithDefault,
} from "../../utils/useDateRangeWithDefault";
import type { Currency } from "../../types/finance";

const FILTER_KEYS = ["zone", "port", "currency"] as const;

// Display scaling for the Port Wise chart: the response carries base-currency
// amounts (rupees / dollars) which we scale to Cr (INR) or M (USD).
const chartScale: Record<Currency, { divisor: number; unit: string }> = {
  INR: { divisor: 10_000_000, unit: "Cr" },
  USD: { divisor: 1_000_000, unit: "M" },
};

export const Revenue = () => {
  const t = useBrandTokens();
  const [, setSearchParams] = useSearchParams();
  const { values, set } = useUrlParams(FILTER_KEYS);
  const { zone, port } = values;
  const currency: Currency = values.currency === "USD" ? "USD" : "INR";

  // Default window is one year back to today (independent of the carried-down
  // Finance range, per the Revenue spec).
  const { value, fromDate, toDate, start, end, setRange } = useDateRangeWithDefault(12);

  const { data, isLoading, isError, error, refetch } = useApi(
    ["revenue", fromDate, toDate, zone, port, currency],
    () => financeApi.revenueBreakdown({ fromDate, toDate, zone, port, currency }),
  );

  // Slice/card colors are owned by the UI, not the API: assign from the shared
  // pool by the segment's position in the response (cycling if it ever exceeds
  // the pool size) so cards and donut slices stay in lockstep.
  const colorBySegment = useMemo(() => {
    const out: Record<string, string> = {};
    (data?.items ?? []).forEach((it, i) => {
      out[it.segment] = donutColors[i % donutColors.length];
    });
    return out;
  }, [data]);

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

  // Clear every filter param in one update so the page reverts to its defaults
  // (All zone/port, INR, one-year range). A single call keeps the zone/port/
  // currency and date-range params from clobbering each other.
  const resetAll = () => setSearchParams({}, { replace: true });

  // Export to Excel — placeholder only; not wired up yet.
  const handleExport = () => {};

  return (
    <>
      <PageHeader
        title="Revenue"
        datePill={formatDateRangePill(start, end)}
        filters={
          <RevenueFilters
            zone={zone}
            port={port}
            dateValue={value}
            currency={currency}
            onZoneChange={(v) => set("zone", v)}
            onPortChange={(v) => set("port", v)}
            onDateChange={setRange}
            onCurrencyChange={(v) => set("currency", v === "INR" ? undefined : v)}
            onExport={handleExport}
            onReset={resetAll}
          />
        }
      />

      {isError ? (
        <ErrorRetry title="Could not load revenue" error={error} onRetry={refetch} />
      ) : (
        <>
          <Card
            title={<CardTitle icon={<PieChartOutlined />}>Segment Wise</CardTitle>}
            style={{ marginBottom: 16 }}
          >
            <ErrorBoundary level="section" label="revenue segment wise">
              {isLoading || !data ? (
                <Skeleton active paragraph={{ rows: 6 }} />
              ) : (
                <Row gutter={[20, 20]} align="middle">
                  <Col xs={24} md={14}>
                    <Row gutter={[16, 16]}>
                      {data.items.map((it) => (
                        <Col xs={12} lg={6} key={it.segment}>
                          <RevenueKpiCard
                            segment={it.segment}
                            value={it.value}
                            deltaVsBudget={it.deltaVsBudget}
                            deltaVsLastYear={it.deltaVsLastYear}
                            currency={currency}
                            hoverColor={colorBySegment[it.segment]}
                          />
                        </Col>
                      ))}
                    </Row>
                  </Col>
                  <Col xs={24} md={10}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <RevenueDonut
                          items={data.items}
                          colorBySegment={colorBySegment}
                          total={data.total}
                          currency={currency}
                        />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        <DeltaStat value={data.totalDeltaVsBudget} label="vs Budget" />
                        <DeltaStat value={data.totalDeltaVsLastYear} label="vs last year" />
                      </div>
                    </div>
                  </Col>
                </Row>
              )}
            </ErrorBoundary>
          </Card>

          <Card title={<CardTitle icon={<BarChartOutlined />}>Port Wise</CardTitle>} style={{ background: t.cardBg }}>
            <ErrorBoundary level="section" label="revenue port wise" resetKeys={[port, currency]}>
              <BudgetActualColumnChart rows={portRows} unit={unit} loading={isLoading} />
            </ErrorBoundary>
          </Card>
        </>
      )}
    </>
  );
};
