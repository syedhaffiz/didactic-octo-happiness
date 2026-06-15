import { Col, Row, Skeleton } from "antd";
import { FolderOpenOutlined, WarningOutlined } from "@ant-design/icons";
import { SummaryCard } from "../SummaryCard";
import type { LegalSummary } from "../../types/legal";

// Two summary cards side by side: Legal Case Summary + Critical Issue Summary.
// While loading, each card slot shows a skeleton of similar height.
export const LegalSummaryCards = ({
  summary,
  loading,
}: {
  summary?: LegalSummary;
  loading: boolean;
}) => (
  <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
    <Col xs={24} lg={12}>
      {loading || !summary ? (
        <Skeleton.Input active style={{ width: "100%", height: 96 }} />
      ) : (
        <SummaryCard
          icon={<FolderOpenOutlined />}
          title="Legal Case Summary"
          stats={[
            { value: summary.newCases, label: "New Cases" },
            { value: summary.totalCases, label: "Total Cases" },
          ]}
        />
      )}
    </Col>
    <Col xs={24} lg={12}>
      {loading || !summary ? (
        <Skeleton.Input active style={{ width: "100%", height: 96 }} />
      ) : (
        <SummaryCard
          icon={<WarningOutlined />}
          title="Critical Issue Summary"
          stats={[
            { value: summary.newIssues, label: "New Issues" },
            { value: summary.totalIssues, label: "Total Issues" },
          ]}
        />
      )}
    </Col>
  </Row>
);
