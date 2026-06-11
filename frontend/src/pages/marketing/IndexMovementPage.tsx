import { Card, Col, Empty, Row, Skeleton } from "antd";
import { ErrorBoundary } from "../../components/ErrorBoundary";
import { PageHeader } from "../../components/PageHeader";
import { ErrorRetry } from "../../components/ErrorRetry";
import { IndexCard } from "../../components/marketing/IndexCard";
import { DEFAULT_RANGE } from "../../components/RangeSelect";
import { marketingApi } from "../../api/marketing";
import { useApi } from "../../api/useApi";

export const IndexMovementPage = () => {
  const { data, isLoading, isError, error, refetch } = useApi(
    ["marketing", "indices", "bulk", DEFAULT_RANGE],
    () => marketingApi.indices(DEFAULT_RANGE),
  );

  const items = data?.items ?? [];

  return (
    <>
      <PageHeader title="Index" datePill="Last Updated: 23 Apr" />

      {isError ? (
        <ErrorRetry title="Could not load indices" error={error} onRetry={refetch} />
      ) : isLoading ? (
        <Row gutter={[16, 16]}>
          {Array.from({ length: 2 }).map((_, i) => (
            <Col xs={24} key={`s${i}`}>
              <Skeleton active paragraph={{ rows: 8 }} />
            </Col>
          ))}
        </Row>
      ) : items.length === 0 ? (
        <Card>
          <Empty description="No indices available" />
        </Card>
      ) : (
        <Row gutter={[16, 16]}>
          {items
            .filter((idx) => idx && typeof idx.code === "string")
            .map((idx, i) => (
              <Col xs={24} key={idx.code ?? i}>
                <ErrorBoundary level="section" label={idx.code}>
                  <IndexCard code={idx.code} initial={idx} />
                </ErrorBoundary>
              </Col>
            ))}
        </Row>
      )}
    </>
  );
};
