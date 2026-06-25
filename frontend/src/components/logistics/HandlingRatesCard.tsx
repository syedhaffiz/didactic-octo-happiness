import { Card, Empty, Skeleton, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { HandlingRateRow } from "../../types/logistics";

const rateHeader = (label: string) => (
  <span>
    {label} <span style={{ fontWeight: 400, color: "#8c8c8c" }}>(INR/MT)</span>
  </span>
);

const columns: ColumnsType<HandlingRateRow> = [
  { title: "Port", dataIndex: "port", key: "port" },
  {
    title: rateHeader("Road"),
    dataIndex: "road",
    key: "road",
    align: "right",
    width: 140,
    render: (v: number) => v.toLocaleString("en-IN"),
  },
  {
    title: rateHeader("Rake"),
    dataIndex: "rake",
    key: "rake",
    align: "right",
    width: 140,
    render: (v: number) => v.toLocaleString("en-IN"),
  },
];

export const HandlingRatesCard = ({
  rows,
  loading,
}: {
  rows?: HandlingRateRow[];
  loading: boolean;
}) => (
  <Card title="Handling Rates" style={{ height: "100%" }}>
    {loading || !rows ? (
      <Skeleton active paragraph={{ rows: 8 }} />
    ) : rows.length === 0 ? (
      <Empty description="No handling rates" />
    ) : (
      <Table
        rowKey="port"
        columns={columns}
        dataSource={rows}
        pagination={false}
        size="middle"
      />
    )}
  </Card>
);
