import type { ReactNode } from "react";
import { Card, Col, Empty, Row, Skeleton } from "antd";
import { CardTitle } from "../CardTitle";
import { ErrorBoundary } from "../ErrorBoundary";
import { ContractCountTile } from "./ContractCountTile";
import { ContractsDonut, type DonutItem } from "./ContractsDonut";

interface Props {
  title: string;
  icon?: ReactNode;
  items: DonutItem[];
  total: number;
  totalCaption?: string;
  loading?: boolean;
  /** Tile grid columns at lg+ (4 for statuses, 2 for ports — as in the Figma). */
  tilesPerRow?: 2 | 3 | 4;
  legendColumns?: number;
  /** Drill into the details table filtered to one bucket. */
  onSelect?: (name: string) => void;
  /** Drill into the details table from the donut's centre total. */
  onTotalClick?: () => void;
}

// A Contracts overview section (Contract status / Port-wise contracts): a grid
// of count tiles on the left, the matching donut on the right. Same layout as
// the Debtors breakdown sections.
export const ContractBreakdownCard = ({
  title,
  icon,
  items,
  total,
  totalCaption,
  loading = false,
  tilesPerRow = 4,
  legendColumns = 3,
  onSelect,
  onTotalClick,
}: Props) => {
  const safeItems = Array.isArray(items) ? items : [];
  const span = 24 / tilesPerRow;

  return (
    <Card title={<CardTitle icon={icon}>{title}</CardTitle>} style={{ marginBottom: 16 }}>
      {loading ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : safeItems.length === 0 ? (
        <Empty description="No contracts for these filters" style={{ padding: 32 }} />
      ) : (
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} xl={tilesPerRow === 2 ? 12 : 15}>
            <Row gutter={[12, 12]}>
              {safeItems.map((item) => (
                <Col key={item.name} xs={12} md={8} lg={span}>
                  <ContractCountTile
                    label={item.name}
                    count={item.count}
                    quantityMt={item.quantityMt}
                    color={item.color}
                    onClick={onSelect && item.count > 0 ? () => onSelect(item.name) : undefined}
                  />
                </Col>
              ))}
            </Row>
          </Col>
          <Col xs={24} xl={tilesPerRow === 2 ? 12 : 9}>
            <ErrorBoundary level="section" label={`${title} chart`}>
              <ContractsDonut
                items={safeItems}
                total={total}
                totalCaption={totalCaption}
                legendColumns={legendColumns}
                onTotalClick={onTotalClick}
              />
            </ErrorBoundary>
          </Col>
        </Row>
      )}
    </Card>
  );
};
