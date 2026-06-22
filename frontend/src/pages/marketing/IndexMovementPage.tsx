import { Col, Row } from "antd";
import { ErrorBoundary } from "../../components/ErrorBoundary";
import { PageHeader } from "../../components/PageHeader";
import { IndexCard } from "../../components/marketing/IndexCard";
import { marketingColors } from "../../theme/tokens";

const [BLUE, PURPLE, ORANGE, PINK, LIGHT_BLUE] = marketingColors.lineSeries;

const CARDS: { code: string; colors: readonly string[]; lg?: number }[] = [
  { code: "ici", colors: [BLUE, PURPLE, ORANGE, PINK, LIGHT_BLUE] },
  { code: "api-daily", colors: [BLUE, PURPLE], lg: 12 },
  { code: "api-weekly", colors: [ORANGE, LIGHT_BLUE], lg: 12 },
];

export const IndexMovementPage = () => (
  <>
    <PageHeader title="Index" datePill="Last Updated: 23 Apr" />
    <Row gutter={[16, 16]}>
      {CARDS.map(({ code, colors, lg }) => (
        <Col key={code} xs={24} lg={lg}>
          <ErrorBoundary level="section" label={code}>
            <IndexCard code={code} colors={colors} />
          </ErrorBoundary>
        </Col>
      ))}
    </Row>
  </>
);
