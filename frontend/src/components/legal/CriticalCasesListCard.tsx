import { Card, Skeleton, Table } from "antd";
import { buildCriticalCasesColumns } from "./criticalCasesColumns";
import type { CriticalCase } from "../../types/legal";

interface Props {
  items?: CriticalCase[];
  loading: boolean;
  onOpenDetails: (caseNo: string) => void;
}

// Card wrapping the Critical Cases table. The 12 columns scroll horizontally
// on narrow viewports; Sr No + Case No stay frozen on the left. Paginates
// 10 rows at a time.
export const CriticalCasesListCard = ({ items, loading, onOpenDetails }: Props) => {
  const columns = buildCriticalCasesColumns({ onOpenDetails });
  return (
    <Card title="Critical Cases List">
      {loading || !items ? (
        <Skeleton active paragraph={{ rows: 8 }} />
      ) : (
        <Table
          rowKey="caseNo"
          size="small"
          columns={columns}
          dataSource={items}
          pagination={{ pageSize: 10, showSizeChanger: false }}
          scroll={{ x: "max-content" }}
        />
      )}
    </Card>
  );
};
