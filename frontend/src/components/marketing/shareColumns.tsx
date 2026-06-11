import type { ColumnsType } from "antd/es/table";
import type { ShareRow, ZoneShareRow } from "../../types/marketing";

export const overallShareColumns: ColumnsType<ShareRow> = [
  { title: "Category", dataIndex: "category", key: "category" },
  { title: "MMT", dataIndex: "mmt", key: "mmt", align: "right" },
  { title: "Total MMT", dataIndex: "totalMmt", key: "totalMmt", align: "right" },
  { title: "% Share", dataIndex: "pct", key: "pct", align: "right" },
];

export const zoneShareColumns: ColumnsType<ZoneShareRow> = [
  { title: "Zone", dataIndex: "zone", key: "zone" },
  { title: "% Share", dataIndex: "pct", key: "pct", align: "right" },
];
