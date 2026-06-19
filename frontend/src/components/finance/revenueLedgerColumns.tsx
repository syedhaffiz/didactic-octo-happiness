import type { ColumnsType } from "antd/es/table";
import { brand } from "../../theme/tokens";
import type { RevenuePortRow, RevenueSegmentRow } from "../../types/finance";

const LinkText = ({ value }: { value: string }) => (
  <span style={{ color: brand.accent, fontWeight: 600 }}>{value}</span>
);

const Amount = ({ value }: { value: number }) =>
  Number.isFinite(value) ? <>{value.toLocaleString()}</> : <>—</>;

const SHARED_TAIL: ColumnsType<RevenuePortRow & RevenueSegmentRow> = [
  {
    title: "Account Number",
    dataIndex: "accountNumber",
    key: "accountNumber",
    width: 180,
    sorter: (a, b) => a.accountNumber.localeCompare(b.accountNumber),
    render: (v: string) => <LinkText value={v} />,
  },
  {
    title: "Profit Centre",
    dataIndex: "profitCentre",
    key: "profitCentre",
    width: 200,
    sorter: (a, b) => a.profitCentre.localeCompare(b.profitCentre),
  },
  {
    title: "Accumulated Balance",
    dataIndex: "accumulatedBalance",
    key: "accumulatedBalance",
    align: "right",
    width: 200,
    sorter: (a, b) => a.accumulatedBalance - b.accumulatedBalance,
    render: (v: number) => <Amount value={v} />,
  },
];

export const buildRevenuePortColumns = (): ColumnsType<RevenuePortRow> => [
  {
    title: "Port",
    dataIndex: "port",
    key: "port",
    width: 160,
    fixed: "left",
    sorter: (a, b) => a.port.localeCompare(b.port),
  },
  {
    title: "Company Code",
    dataIndex: "companyCode",
    key: "companyCode",
    width: 160,
    fixed: "left",
    sorter: (a, b) => a.companyCode.localeCompare(b.companyCode),
    render: (v: string) => <LinkText value={v} />,
  },
  ...(SHARED_TAIL as ColumnsType<RevenuePortRow>),
];

export const buildRevenueSegmentColumns = (): ColumnsType<RevenueSegmentRow> => [
  {
    title: "Segment",
    dataIndex: "segment",
    key: "segment",
    width: 160,
    fixed: "left",
    sorter: (a, b) => a.segment.localeCompare(b.segment),
  },
  {
    title: "Company Code",
    dataIndex: "companyCode",
    key: "companyCode",
    width: 160,
    fixed: "left",
    sorter: (a, b) => a.companyCode.localeCompare(b.companyCode),
    render: (v: string) => <LinkText value={v} />,
  },
  ...(SHARED_TAIL as ColumnsType<RevenueSegmentRow>),
];
