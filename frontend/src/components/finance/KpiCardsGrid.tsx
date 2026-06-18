import { Col, Row } from "antd";
import { KpiCard } from "../KpiCard";
import type { KPI } from "../../types/finance";

// Number of KPI slots the Figma Overview shows. Used so the grid renders the
// same shape while loading (placeholders) as it does with real data.
const SLOTS = 5;

interface Props {
  kpis?: KPI[];
  loading: boolean;
}

// 3-column grid of KPI cards. Always renders SLOTS positions so the layout is
// stable from the first paint — even with no data each Col contains a KpiCard
// in its loading state, so the page never goes blank or shifts when the
// payload lands.
export const KpiCardsGrid = ({ kpis, loading }: Props) => {
  const safe = Array.isArray(kpis) ? kpis : [];
  return (
    <Row gutter={[16, 16]}>
      {Array.from({ length: SLOTS }, (_, i) => {
        const kpi = safe[i];
        return (
          <Col xs={24} sm={12} md={8} key={kpi?.id ?? `kpi-slot-${i}`}>
            <KpiCard kpi={kpi} loading={loading} />
          </Col>
        );
      })}
    </Row>
  );
};
