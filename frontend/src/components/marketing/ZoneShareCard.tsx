import { Card, Col, Empty, Row, Skeleton, Table } from "antd";
import { ErrorBoundary } from "../ErrorBoundary";
import { CenteredDonut } from "../CenteredDonut";
import { zoneShareColumns } from "./shareColumns";
import { marketingColors } from "../../theme/tokens";
import type { MarketShareResponse } from "../../types/marketing";

type ByZone = MarketShareResponse["byZone"];

const ZoneTable = ({ rows }: { rows: ByZone["rows"] }) => (
  <Table
    size="small"
    rowKey="zone"
    columns={zoneShareColumns}
    dataSource={rows}
    pagination={false}
  />
);

// Own Market Share by Zone — two zone tables (split in half) + 8-segment donut.
export const ZoneShareCard = ({
  byZone,
  unit,
  loading,
}: {
  byZone?: ByZone;
  unit: string;
  loading: boolean;
}) => {
  const rows = byZone?.rows ?? [];
  const slices = byZone?.slices ?? [];
  const half = Math.ceil(rows.length / 2);

  return (
    <Card title="Own Market Share by Zone">
      {loading || !byZone ? (
        <Skeleton active paragraph={{ rows: 5 }} />
      ) : (
        <Row gutter={[24, 16]} align="middle">
          <Col xs={24} lg={14}>
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <ZoneTable rows={rows.slice(0, half)} />
              </Col>
              <Col xs={24} sm={12}>
                <ZoneTable rows={rows.slice(half)} />
              </Col>
            </Row>
          </Col>
          <Col xs={24} lg={10}>
            {slices.length === 0 ? (
              <Empty />
            ) : (
              <ErrorBoundary level="section" label="zone share chart">
                <CenteredDonut
                  slices={slices}
                  colors={marketingColors.zoneDonut}
                  total={byZone.total ?? 0}
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
