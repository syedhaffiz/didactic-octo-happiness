import { Card, Col, Row, Skeleton } from "antd";
import { ErrorRetry } from "../../components/ErrorRetry";
import { PageHeader } from "../../components/PageHeader";
import { BreakdownCard } from "../../components/BreakdownCard";
import { DonutChart } from "../../components/DonutChart";
import { LedgerTable } from "../../components/LedgerTable";
import { DateRangeFilter } from "../../components/DateRangeFilter";
import { PortFilter } from "../../components/filters/PortFilter";
import { useApi } from "../../api/useApi";
import { useUrlDateRange, useUrlParam } from "../../utils/useUrlParam";
import { useBrandTokens } from "../../theme/useBrandTokens";
import type { PortRangeParams } from "../../api/finance";
import type { BreakdownResponse } from "../../types/finance";

interface BreakdownPageProps {
  title: string;
  sectionTitle: string;
  fetch: (params: PortRangeParams) => Promise<BreakdownResponse>;
  cacheKey: string;
}

export const BreakdownPage = ({
  title,
  sectionTitle,
  fetch,
  cacheKey,
}: BreakdownPageProps) => {
  const t = useBrandTokens();
  const [port, setPort] = useUrlParam("port");
  const [range, setRange, dateRange] = useUrlDateRange();

  const { data, isLoading, isError, error, refetch } = useApi(
    [cacheKey, port, dateRange],
    () => fetch({ port, dateRange }),
  );

  return (
    <>
      <PageHeader
        title={title}
        filters={
          <>
            <PortFilter value={port} onChange={setPort} />
            <DateRangeFilter value={range} onChange={setRange} />
          </>
        }
      />

      {isError ? (
        <ErrorRetry title={`Could not load ${title.toLowerCase()}`} error={error} onRetry={refetch} />
      ) : (
        <>
          <Card
            title={sectionTitle}
            style={{ marginBottom: 16, background: t.panelBg }}
            styles={{ header: { borderBottom: "none" }, body: { paddingTop: 4 } }}
          >
            {isLoading || !data ? (
              <Skeleton active paragraph={{ rows: 6 }} />
            ) : (
              <Row gutter={[20, 20]} align="middle">
                <Col xs={24} md={14}>
                  <Row gutter={[16, 16]}>
                    {data.breakdown.map((b) => (
                      <Col xs={12} sm={12} md={12} key={b.segment}>
                        <BreakdownCard segment={b.segment} value={b.value} />
                      </Col>
                    ))}
                  </Row>
                </Col>
                <Col xs={24} md={10}>
                  <DonutChart donut={data.donut} />
                </Col>
              </Row>
            )}
          </Card>

          <Card>
            {isLoading || !data ? (
              <Skeleton active paragraph={{ rows: 8 }} />
            ) : (
              <LedgerTable rows={data.ledger} />
            )}
          </Card>
        </>
      )}
    </>
  );
};
