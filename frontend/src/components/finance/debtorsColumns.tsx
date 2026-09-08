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
    <Tooltip title={value.toLocaleString(undefined, { maximumFractionDigits: 2 })}>
      <span style={strong ? { fontWeight: 600, color: brand.headline } : undefined}>{fmt(value)}</span>
    </Tooltip>
  );
};

const money = (
  key: keyof DebtorRow,
  title: string,
  width: number,
  strong = false,
): ColumnsType<DebtorRow>[number] => ({
  title,
  dataIndex: key,
  key: key as string,
  align: "right",
  width,
  sorter: (a, b) => (a[key] as number) - (b[key] as number),
  render: (v: number) => <MoneyCell value={v} strong={strong} />,
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
  money("balanceOutstanding", "Balance Outstanding", 170),
  money("notedLc", "Noted LC", 120),
  money("lc", "LC", 140),
  money("netReceivable", "Net Receivable", 160, true),
];
