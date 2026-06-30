import type { ColumnsType } from "antd/es/table";
import { textSearchFilter } from "../columnFilters";
import type { CriticalIssue } from "../../types/legal";
import { brand } from "../../theme/tokens";

const MultiLine = ({ value }: { value: string }) => (
  <span style={{ whiteSpace: "pre-line", display: "block", lineHeight: 1.5 }}>{value}</span>
);

const Amount = ({ value }: { value: string }) => (
  <span style={{ color: brand.accent, fontWeight: 600 }}>{value}</span>
);

export const criticalIssuesColumns: ColumnsType<CriticalIssue> = [
  {
    title: "Sr No",
    dataIndex: "srNo",
    key: "srNo",
    width: 70,
    ...textSearchFilter<CriticalIssue>((r) => String(r.srNo), "Search Sr No"),
  },
  {
    title: "Legal Issue",
    dataIndex: "legalIssue",
    key: "legalIssue",
    render: (v: string) => <MultiLine value={v} />,
    ...textSearchFilter<CriticalIssue>((r) => r.legalIssue, "Search Legal Issue"),
  },
  {
    title: "Amount Involved",
    dataIndex: "amountInvolved",
    key: "amountInvolved",
    width: 160,
    align: "center",
    render: (v: string) => <Amount value={v} />,
    ...textSearchFilter<CriticalIssue>((r) => r.amountInvolved, "Search Amount"),
  },
  {
    title: "Current Status",
    dataIndex: "currentStatus",
    key: "currentStatus",
    width: 240,
    render: (v: string) => <MultiLine value={v} />,
    ...textSearchFilter<CriticalIssue>((r) => r.currentStatus, "Search Status"),
  },
];
