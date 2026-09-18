import type { ReactNode } from "react";
import { Card, Col, Row, Skeleton } from "antd";
import { CardTitle } from "../../CardTitle";
import { ReceivableTileCard } from "./ReceivableTileCard";
import { DebtorsReceivablesDonut } from "./DebtorsReceivablesDonut";
import type { Currency, DebtorsBreakdownItem } from "../../../types/finance";

interface Props {
  title: string;
  icon?: ReactNode;
  items: DebtorsBreakdownItem[];
  netReceivable: number;
  totalDue: number;
  totalNotDue: number;
  currency: Currency;
  loading?: boolean;
  /** Called with the segment/group name when a tile is activated. */
  onSelect: (name: string) => void;
  /** Called when the donut centre is activated (drill in with no filter). */
  onNetClick: () => void;
}

// A receivables breakdown section (Segment-wise / Group-wise): a grid of tile
// cards on the left and a donut on the right, sharing one data set. The tiles
// and the donut centre are the drill-in links.
export const DebtorsBreakdownSection = ({
  title,
  icon,
  items,
  netReceivable,
  totalDue,
  totalNotDue,
  currency,
  loading = false,
  onSelect,
  onNetClick,
}: Props) => (
  <Card
    title={<CardTitle icon={icon}>{title}</CardTitle>}
    style={{ marginBottom: 16 }}
  >
    {loading ? (
      <Skeleton active paragraph={{ rows: 6 }} />
    ) : (
      <Row gutter={[20, 20]} align="middle">
        <Col xs={24} lg={15}>
          {items.length === 0 ? (
            <div style={{ padding: 24, textAlign: "center", opacity: 0.6 }}>No data</div>
          ) : (
            <Row gutter={[12, 12]}>
              {items.map((item) => (
                <Col key={item.name} xs={12} md={8}>
                  <ReceivableTileCard item={item} currency={currency} onClick={onSelect} />
                </Col>
              ))}
            </Row>
          )}
        </Col>
        <Col xs={24} lg={9}>
          <DebtorsReceivablesDonut
            items={items}
            netReceivable={netReceivable}
            totalDue={totalDue}
            totalNotDue={totalNotDue}
            currency={currency}
            onCenterClick={onNetClick}
          />
        </Col>
      </Row>
    )}
  </Card>
);
