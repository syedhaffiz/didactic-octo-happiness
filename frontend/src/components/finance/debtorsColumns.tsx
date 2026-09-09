import { Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import { brand } from "../../theme/tokens";
import type { DebtorRow } from "../../types/finance";

// Plain grouped number with up to two decimals — the amounts are already in the
// selected currency's base unit, and the design shows them without a symbol.
const fmt = (value: number): string =>
  value.toLocaleString(undefined, { maximumFractionDigits: 2 });

// Right-aligned money cell. Zero reads muted; the full value sits in a tooltip
// so truncated large numbers stay inspectable.
const MoneyCell = ({ value, strong = false }: { value: number; strong?: boolean }) => {
  if (!Number.isFinite(value)) return <>—</>;
  if (value === 0) return <span style={{ color: brand.textMuted }}>0</span>;
  return (
    <Tooltip title={fmt(value)}>
      <span style={strong ? { fontWeight: 600, color: brand.headline } : undefined}>{fmt(value)}</span>
    </Tooltip>
  );
};

// The numeric columns, in display order. A single source of truth shared with
// the page so its pinned Total row sums exactly these keys, in the same order.
export type DebtorMoneyKey =
  | "balanceOutstanding"
  | "notedLc"
  | "lc"
  | "netReceivable"
  | "contractuallyNotDue"
  | "tdsMaterial"
  | "notDue"
  | "dueAmount"
  | "age0_30"
  | "age31_60"
  | "age61_90"
  | "age91_120"
  | "age121_180"
  | "age181_365"
  | "age1_2yr"
  | "age2yr_plus";

export interface MoneyColumnDef {
  key: DebtorMoneyKey;
  title: string;
  width: number;
  strong?: boolean;
}

export const DEBTOR_MONEY_COLUMNS: MoneyColumnDef[] = [
  { key: "balanceOutstanding", title: "Balance Outstanding", width: 170 },
  { key: "notedLc", title: "Noted LC", width: 120 },
  { key: "lc", title: "LC", width: 130 },
  { key: "netReceivable", title: "Net Receivable", width: 150, strong: true },
  { key: "contractuallyNotDue", title: "Contractually Not Due", width: 180 },
  { key: "tdsMaterial", title: "TDS Material", width: 130 },
  { key: "notDue", title: "Not Due", width: 130 },
  { key: "dueAmount", title: "Due Amount", width: 140 },
  { key: "age0_30", title: "0-30", width: 120 },
  { key: "age31_60", title: "31-60", width: 120 },
  { key: "age61_90", title: "61-90", width: 120 },
  { key: "age91_120", title: "91-120", width: 120 },
  { key: "age121_180", title: "121-180", width: 120 },
  { key: "age181_365", title: "181-365", width: 120 },
  { key: "age1_2yr", title: "1-2 Years", width: 120 },
  { key: "age2yr_plus", title: "2 Years +", width: 120 },
];

const moneyColumn = (c: MoneyColumnDef): ColumnsType<DebtorRow>[number] => ({
  title: c.title,
  dataIndex: c.key,
  key: c.key,
  align: "right",
  width: c.width,
  sorter: (a, b) => (a[c.key] as number) - (b[c.key] as number),
  render: (v: number) => <MoneyCell value={v} strong={c.strong} />,
});

export const buildDebtorsColumns = (): ColumnsType<DebtorRow> => [
  {
    title: "Customer Number",
    dataIndex: "customerNumber",
    key: "customerNumber",
    width: 150,
    sorter: (a, b) => a.customerNumber.localeCompare(b.customerNumber),
  },
  {
    title: "Customer",
    dataIndex: "customer",
    key: "customer",
    width: 240,
    fixed: "left",
    sorter: (a, b) => a.customer.localeCompare(b.customer),
    render: (v: string) => <span style={{ fontWeight: 600 }}>{v}</span>,
  },
  {
    title: "Zone",
    dataIndex: "zone",
    key: "zone",
    width: 110,
    sorter: (a, b) => a.zone.localeCompare(b.zone),
    render: (v: string) => <span style={{ color: brand.accent }}>{v}</span>,
  },
  {
    title: "Port Name",
    dataIndex: "portName",
    key: "portName",
    width: 140,
    sorter: (a, b) => a.portName.localeCompare(b.portName),
  },
  {
    title: "Segment Name",
    dataIndex: "segmentName",
    key: "segmentName",
    width: 140,
    sorter: (a, b) => a.segmentName.localeCompare(b.segmentName),
  },
  {
    title: "Group",
    dataIndex: "group",
    key: "group",
    width: 130,
    sorter: (a, b) => a.group.localeCompare(b.group),
  },
  ...DEBTOR_MONEY_COLUMNS.map(moneyColumn),
];
