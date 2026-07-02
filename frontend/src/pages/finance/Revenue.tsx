import { useMemo } from "react";
import { Card, Col, Row, Skeleton, Space } from "antd";
import { ErrorBoundary } from "../../components/ErrorBoundary";
import { ErrorRetry } from "../../components/ErrorRetry";
import { PageHeader } from "../../components/PageHeader";
import { DateRangeFilter } from "../../components/DateRangeFilter";
import { PeriodToggle, useRevenuePeriod } from "../../components/finance/PeriodToggle";
import { RevenueChildLinks } from "../../components/finance/RevenueChildLinks";
import { RevenueDonut } from "../../components/finance/RevenueDonut";
import { RevenueKpiCard } from "../../components/finance/RevenueKpiCard";
import { financeApi } from "../../api/finance";
import { useApi } from "../../api/useApi";
import { useBrandTokens } from "../../theme/useBrandTokens";
import { donutColors } from "../../theme/tokens";
import {
  formatDateRangePill,
  useDateRangeWithDefault,
} from "../../utils/useDateRangeWithDefault";

export const Revenue = () => {
  const t = useBrandTokens();
  const [period] = useRevenuePeriod();
  const { start, end, value, fromDate, toDate, setRange } = useDateRangeWithDefault(1, {
    persist: true,
  });

  const { data, isLoading, isError, error, refetch } = useApi(
    ["revenue-breakdown", period, fromDate, toDate],
    () => financeApi.revenueBreakdown({ period, fromDate, toDate }),
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

  return (
    <>
      <PageHeader
        title="Revenue"
        datePill={formatDateRangePill(start, end)}
        filters={<DateRangeFilter value={value} onChange={setRange} />}
      />

      {isError ? (
        <ErrorRetry title="Could not load revenue" error={error} onRetry={refetch} />
      ) : (
        <>
          <Card
            title="Revenue Breakdown"
            extra={<PeriodToggle />}
            style={{ marginBottom: 16, background: t.panelBg }}
            styles={{ header: { borderBottom: "none" }, body: { paddingTop: 4 } }}
          >
            <ErrorBoundary level="section" label="revenue breakdown">
              {isLoading || !data ? (
                <Skeleton active paragraph={{ rows: 6 }} />
              ) : (
                <Row gutter={[20, 20]} align="middle">
                  <Col xs={24} md={14}>
                    <Row gutter={[16, 16]}>
                      {data.items.map((it) => (
                        <Col xs={12} sm={12} md={12} lg={6} key={it.segment}>
                          <RevenueKpiCard
                            segment={it.segment}
                            value={it.value}
                            hoverColor={colorBySegment[it.segment]}
                          />
                        </Col>
                      ))}
                    </Row>
                  </Col>
                  <Col xs={24} md={10}>
                    <RevenueDonut
                      items={data.items}
                      colorBySegment={colorBySegment}
                      total={data.total}
                    />
                  </Col>
                </Row>
              )}
            </ErrorBoundary>
          </Card>

          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            <RevenueChildLinks />
          </Space>
        </>
      )}
    </>
  );
};
