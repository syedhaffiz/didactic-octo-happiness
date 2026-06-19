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
import { useUrlDateRange } from "../../utils/useUrlParam";

export const Revenue = () => {
  const t = useBrandTokens();
  const [period] = useRevenuePeriod();
  const [range, setRange] = useUrlDateRange();

  const { data, isLoading, isError, error, refetch } = useApi(
    ["revenue-breakdown", period],
    () => financeApi.revenueBreakdown({ period }),
  );

  const colorBySegment = useMemo(() => {
    const out: Record<string, string> = {};
    for (const c of data?.cards ?? []) out[c.segment] = c.color;
    return out;
  }, [data]);

  return (
    <>
      <PageHeader
        title="Revenue"
        datePill="Apr 25 : Feb 26"
        filters={<DateRangeFilter value={range} onChange={setRange} />}
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
                      {data.cards.map((c) => (
                        <Col xs={12} sm={12} md={12} lg={6} key={c.segment}>
                          <RevenueKpiCard
                            segment={c.segment}
                            value={c.value}
                            hoverColor={c.color}
                          />
                        </Col>
                      ))}
                    </Row>
                  </Col>
                  <Col xs={24} md={10}>
                    <RevenueDonut
                      slices={data.slices}
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
