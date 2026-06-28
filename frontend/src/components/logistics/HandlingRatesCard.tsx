import { Card, Empty, Skeleton, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { brand } from "../../theme/tokens";
import { ErrorRetry } from "../ErrorRetry";
import { logisticsApi } from "../../api/logistics";
import { useApi } from "../../api/useApi";
import type { HandlingRateRow } from "../../types/logistics";

const rateHeader = (label: string) => (
  <span>
    {label} <span style={{ fontWeight: 400, color: brand.textMuted }}>(INR/MT)</span>
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
    sorter: (a, b) => a.road - b.road,
    render: (v: number) => v.toLocaleString("en-IN"),
  },
  {
    title: rateHeader("Rake"),
    dataIndex: "rake",
    key: "rake",
    align: "right",
    width: 140,
    sorter: (a, b) => a.rake - b.rake,
    render: (v: number) => v.toLocaleString("en-IN"),
  },
];

export const HandlingRatesCard = () => {
  const { data, isLoading, isError, error, refetch } = useApi(
    ["logistics", "handling-rates"],
    () => logisticsApi.handlingRates(),
  );
  const rows = data?.items;

  return (
    <Card title="Handling Rates" style={{ height: "100%" }}>
      {isError ? (
        <ErrorRetry title="Could not load handling rates" error={error} onRetry={refetch} />
      ) : isLoading || !rows ? (
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
};
