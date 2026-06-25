import { useMemo, useState } from "react";
import { Card, Empty, Skeleton, Space, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useBrandTokens } from "../../theme/useBrandTokens";
import {
  VesselTreeFilter,
  filterVesselRows,
  type VesselFilterValue,
} from "./VesselTreeFilter";
import type { VesselSailedRow } from "../../types/logistics";

const { Text } = Typography;

const fmtDate = (iso: string) => {
  const d = dayjs(iso);
  return d.isValid() ? d.format("DD MMM YYYY") : iso;
};

export const VesselSailedCard = ({
  rows,
  loading,
}: {
  rows?: VesselSailedRow[];
  loading: boolean;
}) => {
  const t = useBrandTokens();
  const [filter, setFilter] = useState<VesselFilterValue>([]);

  const safeRows = rows ?? [];
  const filtered = useMemo(() => filterVesselRows(safeRows, filter), [safeRows, filter]);

  const columns: ColumnsType<VesselSailedRow> = [
    {
      title: "Vessel",
      dataIndex: "vessel",
      key: "vessel",
      render: (v: string) => <span style={{ color: t.linkBlue, fontWeight: 500 }}>{v}</span>,
    },
    { title: "Coal Grade", dataIndex: "coalGrade", key: "coalGrade" },
    {
      title: "Tonnage (MT)",
      dataIndex: "tonnage",
      key: "tonnage",
      align: "right",
      width: 140,
      render: (v: number) => v.toLocaleString("en-IN"),
    },
    { title: "Origin", dataIndex: "origin", key: "origin", width: 110 },
    {
      title: "BL Date",
      dataIndex: "blDate",
      key: "blDate",
      width: 150,
      render: fmtDate,
    },
    {
      title: "ETA DP",
      dataIndex: "etaDp",
      key: "etaDp",
      width: 150,
      render: fmtDate,
    },
  ];

  return (
    <Card title="Vessel Sailed Out">
      {loading || !rows ? (
        <Skeleton active paragraph={{ rows: 8 }} />
      ) : (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 16,
              flexWrap: "wrap",
              marginBottom: 12,
            }}
          >
            <Space size={6}>
              <Text type="secondary">Sailed Out</Text>
              <Text strong style={{ fontSize: 16, color: t.accentText }}>
                {filtered.length}
              </Text>
            </Space>
            <VesselTreeFilter rows={safeRows} value={filter} onChange={setFilter} />
          </div>

          {safeRows.length === 0 ? (
            <Empty description="No vessels sailed out" />
          ) : (
            <Table
              rowKey="id"
              columns={columns}
              dataSource={filtered}
              pagination={{ pageSize: 10, showSizeChanger: false }}
              size="middle"
            />
          )}
        </>
      )}
    </Card>
  );
};
