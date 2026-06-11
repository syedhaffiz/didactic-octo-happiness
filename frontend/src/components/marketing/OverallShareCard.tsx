import { Card, Col, Empty, Row, Skeleton, Table } from "antd";
import { ErrorBoundary } from "../ErrorBoundary";
import { CenteredDonut } from "../CenteredDonut";
import { overallShareColumns } from "./shareColumns";
import { marketingColors } from "../../theme/tokens";
import type { MarketShareResponse } from "../../types/marketing";

type Overall = MarketShareResponse["overall"];

// Market Share — Own vs Non-Own table + donut.
export const OverallShareCard = ({
  overall,
  unit,
  loading,
}: {
  overall?: Overall;
  unit: string;
  loading: boolean;
}) => {
  const rows = overall?.rows ?? [];
  const slices = overall?.slices ?? [];

  return (
    <Card title="Market Share">
      {loading || !overall ? (
        <Skeleton active paragraph={{ rows: 5 }} />
      ) : (
        <Row gutter={[24, 16]} align="middle">
          <Col xs={24} lg={14}>
            <Table
              size="small"
              rowKey="category"
              columns={overallShareColumns}
              dataSource={rows}
              pagination={false}
            />
          </Col>
          <Col xs={24} lg={10}>
            {slices.length === 0 ? (
              <Empty />
            ) : (
              <ErrorBoundary level="section" label="market share chart">
                <CenteredDonut
                  slices={slices}
                  colors={[marketingColors.shareOwn, marketingColors.shareNonOwn]}
                  total={overall.total ?? 0}
                  unit={unit}
                />
              </ErrorBoundary>
            )}
          </Col>
        </Row>
      )}
    </Card>
  );
};
