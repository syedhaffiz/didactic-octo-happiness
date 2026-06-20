import { Card, Col, Empty, Row, Skeleton } from "antd";
import { ErrorBoundary } from "../../components/ErrorBoundary";
import { PageHeader } from "../../components/PageHeader";
import { ErrorRetry } from "../../components/ErrorRetry";
import { IndexCard } from "../../components/marketing/IndexCard";
import { DEFAULT_INDEX_RANGE } from "../../components/marketing/IndexRangeSelect";
import { marketingApi } from "../../api/marketing";
import { useApi } from "../../api/useApi";
import { marketingColors } from "../../theme/tokens";

// Pin each chart's lines to the figma colors. Built from the existing
// `marketingColors.lineSeries` palette (blue / purple / orange / pink /
// light-blue) so all three cards stay in lockstep with the brand tokens.
const [BLUE, PURPLE, ORANGE, PINK, LIGHT_BLUE] = marketingColors.lineSeries;

const COLORS_BY_CODE: Record<string, readonly string[]> = {
  ici: [BLUE, PURPLE, ORANGE, PINK, LIGHT_BLUE],
  // API 2 = blue, API 4 = purple
  "api-daily": [BLUE, PURPLE],
  // API 3 = orange, API 5 = light-blue
  "api-weekly": [ORANGE, LIGHT_BLUE],
};

export const IndexMovementPage = () => {
  const { data, isLoading, isError, error, refetch } = useApi(
    ["marketing", "indices", "bulk", DEFAULT_INDEX_RANGE],
    () => marketingApi.indices(DEFAULT_INDEX_RANGE),
  );

  const items = data?.items ?? [];
  const ici = items.find((i) => i.code === "ici");
  const apiDaily = items.find((i) => i.code === "api-daily");
  const apiWeekly = items.find((i) => i.code === "api-weekly");

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
          {ici ? (
            <Col xs={24}>
              <ErrorBoundary level="section" label={ici.code}>
                <IndexCard code={ici.code} initial={ici} colors={COLORS_BY_CODE.ici!} />
              </ErrorBoundary>
            </Col>
          ) : null}
          {apiDaily ? (
            <Col xs={24} lg={12}>
              <ErrorBoundary level="section" label={apiDaily.code}>
                <IndexCard
                  code={apiDaily.code}
                  initial={apiDaily}
                  colors={COLORS_BY_CODE["api-daily"]!}
                />
              </ErrorBoundary>
            </Col>
          ) : null}
          {apiWeekly ? (
            <Col xs={24} lg={12}>
              <ErrorBoundary level="section" label={apiWeekly.code}>
                <IndexCard
                  code={apiWeekly.code}
                  initial={apiWeekly}
                  colors={COLORS_BY_CODE["api-weekly"]!}
                />
              </ErrorBoundary>
            </Col>
          ) : null}
        </Row>
      )}
    </>
  );
};
