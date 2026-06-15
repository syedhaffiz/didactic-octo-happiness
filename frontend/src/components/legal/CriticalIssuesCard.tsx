import { Card, Skeleton, Table } from "antd";
import { criticalIssuesColumns } from "./criticalIssuesColumns";
import type { CriticalIssue } from "../../types/legal";

interface Props {
  items?: CriticalIssue[];
  loading: boolean;
}

// Pre-litigation Issues table card — long-form text body cells.
export const CriticalIssuesCard = ({ items, loading }: Props) => (
  <Card title="Pre-litigation Issues">
    {loading || !items ? (
      <Skeleton active paragraph={{ rows: 6 }} />
    ) : (
      <Table
        rowKey="srNo"
        size="small"
        columns={criticalIssuesColumns}
        dataSource={items}
        pagination={{ pageSize: 10, showSizeChanger: false }}
      />
    )}
  </Card>
);
