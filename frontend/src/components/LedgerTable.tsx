import { Input, Table, Tooltip } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useMemo, useState } from "react";
import type { ColumnsType } from "antd/es/table";
import { useBrandTokens } from "../theme/useBrandTokens";
import { formatAccounting } from "../utils/format";
import type { LedgerRow } from "../types/finance";

const numberCell = (value: number, muted: string) => (
  <Tooltip title={value.toLocaleString("en-IN")}>
    <span style={{ color: value === 0 ? muted : undefined }}>{value === 0 ? "0" : formatAccounting(value)}</span>
  </Tooltip>
);

export const LedgerTable = ({ rows }: { rows: LedgerRow[] }) => {
  const t = useBrandTokens();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      [r.accountNumber, r.profitCentre, r.segment, r.grouping].some((v) =>
        v.toLowerCase().includes(q),
      ),
    );
  }, [rows, search]);

  const columns: ColumnsType<LedgerRow> = [
    { title: "Company Code", dataIndex: "companyCode", key: "companyCode", width: 130 },
    {
      title: "Account Number",
      dataIndex: "accountNumber",
      key: "accountNumber",
      width: 170,
      render: (v: string) => <span style={{ color: t.linkBlue, fontWeight: 500 }}>{v}</span>,
    },
    { title: "Profit Centre", dataIndex: "profitCentre", key: "profitCentre" },
    { title: "Segment", dataIndex: "segment", key: "segment", width: 110 },
    { title: "Grouping", dataIndex: "grouping", key: "grouping", width: 140 },
    {
      title: "Debit",
      dataIndex: "debit",
      key: "debit",
      align: "right",
      width: 140,
      render: (v: number) => numberCell(v, t.textSecondary),
    },
    {
      title: "Credit",
      dataIndex: "credit",
      key: "credit",
      align: "right",
      width: 140,
      render: (v: number) => numberCell(v, t.textSecondary),
    },
  ];

  return (
    <>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
        <Input
          placeholder="Search"
          allowClear
          prefix={<SearchOutlined style={{ color: t.textSecondary }} />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 280 }}
        />
      </div>
      <Table
        rowKey={(r) => r.accountNumber}
        columns={columns}
        dataSource={filtered}
        pagination={{ pageSize: 10, showSizeChanger: false }}
        size="middle"
      />
    </>
  );
};
