import { Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { IiaBillingRow, IiaPortType } from "../../../types/marketing";

type TextKey = "date" | "customer" | "vessel" | "port" | "segment" | "vendor" | "tcNumber";
type NumKey = "amount" | "qty" | "plannedQuality";

const byText = (k: TextKey) => (a: IiaBillingRow, b: IiaBillingRow) => a[k].localeCompare(b[k]);
const byNum = (k: NumKey) => (a: IiaBillingRow, b: IiaBillingRow) => a[k] - b[k];

// Port quality mixes GCV figures with grade labels: numbers sort numerically,
// and labels sort after them alphabetically.
const byQuality = (a: IiaBillingRow, b: IiaBillingRow) => {
  const na = Number(a.portQuality);
  const nb = Number(b.portQuality);
  const aNum = Number.isFinite(na);
  const bNum = Number.isFinite(nb);
  if (aNum && bNum) return na - nb;
  if (aNum !== bNum) return aNum ? -1 : 1;
  return a.portQuality.localeCompare(b.portQuality);
};

// Long names truncate with the full text on hover.
const truncated = (v: string) => (
  <Tooltip title={v} placement="topLeft">
    {v}
  </Tooltip>
);

// IIA Billing table columns. Every column sorts client-side; values render raw
// (as the design shows). The quality column is labelled per tab — LP (load
// port) or DP (discharge port).
export const buildIiaBillingColumns = (portType: IiaPortType): ColumnsType<IiaBillingRow> => [
  {
    key: "date",
    title: "Date",
    dataIndex: "date",
    width: 120,
    fixed: "left",
    sorter: byText("date"),
    defaultSortOrder: "descend",
  },
  {
    key: "customer",
    title: "Customer",
    dataIndex: "customer",
    width: 170,
    ellipsis: { showTitle: false },
    render: truncated,
    sorter: byText("customer"),
  },
  {
    key: "vessel",
    title: "Vessel",
    dataIndex: "vessel",
    width: 210,
    ellipsis: { showTitle: false },
    render: truncated,
    sorter: byText("vessel"),
  },
  { key: "port", title: "Port", dataIndex: "port", width: 150, sorter: byText("port") },
  { key: "segment", title: "Segment", dataIndex: "segment", width: 110, sorter: byText("segment") },
  {
    key: "vendor",
    title: "Vendor",
    dataIndex: "vendor",
    width: 220,
    ellipsis: { showTitle: false },
    render: truncated,
    sorter: byText("vendor"),
  },
  { key: "amount", title: "Amount", dataIndex: "amount", width: 120, sorter: byNum("amount") },
  { key: "qty", title: "Qty", dataIndex: "qty", width: 110, sorter: byNum("qty") },
  {
    key: "plannedQuality",
    title: "Planned Quality",
    dataIndex: "plannedQuality",
    width: 150,
    sorter: byNum("plannedQuality"),
  },
  {
    key: "portQuality",
    title: portType === "load" ? "LP Quality" : "DP Quality",
    dataIndex: "portQuality",
    width: 120,
    sorter: byQuality,
  },
  { key: "tcNumber", title: "TC Number", dataIndex: "tcNumber", width: 140, sorter: byText("tcNumber") },
];
