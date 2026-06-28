import { useMemo } from "react";
import { Card, Empty, Skeleton, Space, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useBrandTokens } from "../../theme/useBrandTokens";
import { ErrorRetry } from "../ErrorRetry";
import { treeFilter, uniqueValues } from "../columnFilters";
import { logisticsApi } from "../../api/logistics";
import { useApi } from "../../api/useApi";
import type { VesselSailedRow } from "../../types/logistics";

const { Text } = Typography;

const fmtDate = (iso: string) => {
  const d = dayjs(iso);
  return d.isValid() ? d.format("DD MMM YYYY") : iso;
};

export const VesselSailedCard = ({
  fromDate,
  toDate,
}: {
  fromDate?: string;
  toDate?: string;
}) => {
  const t = useBrandTokens();
  const { data, isLoading, isError, error, refetch } = useApi(
    ["logistics", "vessels-sailed", fromDate, toDate],
    () => logisticsApi.vesselsSailed({ fromDate, toDate }),
  );
  const safeRows = data?.items ?? [];

  // Every column is sortable; Vessel / Coal Grade / Origin carry a searchable
  // tree filter whose options come from the values present in the dataset.
  const columns: ColumnsType<VesselSailedRow> = useMemo(
    () => [
      {
        title: "Vessel",
        dataIndex: "vessel",
        key: "vessel",
        sorter: (a, b) => a.vessel.localeCompare(b.vessel),
        render: (v: string) => <span style={{ color: t.linkBlue, fontWeight: 500 }}>{v}</span>,
        ...treeFilter<VesselSailedRow>(
          uniqueValues(safeRows, (r) => r.vessel),
          (r) => r.vessel,
        ),
      },
      {
        title: "Coal Grade",
        dataIndex: "coalGrade",
        key: "coalGrade",
        sorter: (a, b) => a.coalGrade.localeCompare(b.coalGrade),
        ...treeFilter<VesselSailedRow>(
          uniqueValues(safeRows, (r) => r.coalGrade),
          (r) => r.coalGrade,
        ),
      },
      {
        title: "Tonnage (MT)",
        dataIndex: "tonnage",
        key: "tonnage",
        align: "right",
        width: 140,
        sorter: (a, b) => a.tonnage - b.tonnage,
        render: (v: number) => v.toLocaleString("en-IN"),
      },
      {
        title: "Origin",
        dataIndex: "origin",
        key: "origin",
        width: 110,
        sorter: (a, b) => a.origin.localeCompare(b.origin),
        ...treeFilter<VesselSailedRow>(
          uniqueValues(safeRows, (r) => r.origin),
          (r) => r.origin,
        ),
      },
      {
        title: "BL Date",
        dataIndex: "blDate",
        key: "blDate",
        width: 150,
        // ISO yyyy-mm-dd sorts chronologically as a string.
        sorter: (a, b) => a.blDate.localeCompare(b.blDate),
        render: fmtDate,
      },
      {
        title: "ETA DP",
        dataIndex: "etaDp",
        key: "etaDp",
        width: 150,
        sorter: (a, b) => a.etaDp.localeCompare(b.etaDp),
        render: fmtDate,
      },
    ],
    [safeRows, t.linkBlue],
  );

  return (
    <Card title="Vessel Sailed Out">
      {isError ? (
        <ErrorRetry title="Could not load vessels sailed out" error={error} onRetry={refetch} />
      ) : isLoading || !data ? (
        <Skeleton active paragraph={{ rows: 8 }} />
      ) : safeRows.length === 0 ? (
        <Empty description="No vessels sailed out" />
      ) : (
        <>
          <Space size={6} style={{ marginBottom: 12 }}>
            <Text type="secondary">Sailed Out</Text>
            <Text strong style={{ fontSize: 16, color: t.accentText }}>
              {safeRows.length}
            </Text>
          </Space>
          <Table<VesselSailedRow>
            rowKey="id"
            columns={columns}
            dataSource={safeRows}
            pagination={{ pageSize: 10, showSizeChanger: false }}
            size="middle"
            scroll={{ x: "max-content" }}
          />
        </>
      )}
    </Card>
  );
};
