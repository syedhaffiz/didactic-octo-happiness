import type { ColumnsType } from "antd/es/table";
import { BatchIdLink } from "./BatchIdLink";
import { textSearchFilter, treeFilter, uniqueValues } from "../columnFilters";
import type {
  HandlingBatchDetailRow,
  SalesBatchDetailRow,
} from "../../types/finance";

const SALES_BASE = "/finance/overview/profitability/vessels/sales";
const HANDLING_BASE = "/finance/overview/profitability/vessels/handling";

const Number0 = ({ value }: { value: number }) =>
  Number.isFinite(value) ? <>{value.toLocaleString()}</> : <>—</>;

// Sales batch detail columns -------------------------------------------
export const buildSalesBatchDetailColumns = (
  rows: readonly SalesBatchDetailRow[] = [],
  basePath = SALES_BASE,
): ColumnsType<SalesBatchDetailRow> => [
  {
    title: "Batch No",
    dataIndex: "batchId",
    key: "batchId",
    width: 160,
    fixed: "left",
    sorter: (a, b) => a.batchId.localeCompare(b.batchId),
    render: (v: string) => <BatchIdLink batchId={v} basePath={basePath} />,
    ...textSearchFilter<SalesBatchDetailRow>((r) => r.batchId, "Search Batch No"),
  },
  {
    title: "Customer Name",
    dataIndex: "customerName",
    key: "customerName",
    width: 200,
    fixed: "left",
    sorter: (a, b) => a.customerName.localeCompare(b.customerName),
    ...textSearchFilter<SalesBatchDetailRow>((r) => r.customerName, "Search Customer"),
  },
  {
    title: "Plant Name",
    dataIndex: "plantName",
    key: "plantName",
    sorter: (a, b) => a.plantName.localeCompare(b.plantName),
    ...treeFilter<SalesBatchDetailRow>(
      uniqueValues(rows, (r) => r.plantName),
      (r) => r.plantName,
    ),
  },
  {
    title: "Trade Contract No",
    dataIndex: "tradeContractNo",
    key: "tradeContractNo",
    width: 170,
    sorter: (a, b) => a.tradeContractNo.localeCompare(b.tradeContractNo),
    ...treeFilter<SalesBatchDetailRow>(
      uniqueValues(rows, (r) => r.tradeContractNo),
      (r) => r.tradeContractNo,
    ),
  },
  {
    title: "Bill Amount",
    dataIndex: "billAmount",
    key: "billAmount",
    align: "right",
    width: 150,
    sorter: (a, b) => a.billAmount - b.billAmount,
    render: (v: number) => <Number0 value={v} />,
  },
  {
    title: "Bill Quantity",
    dataIndex: "billQuantity",
    key: "billQuantity",
    align: "right",
    width: 150,
    sorter: (a, b) => a.billQuantity - b.billQuantity,
    render: (v: number) => <Number0 value={v} />,
  },
  {
    title: "COGS Value",
    dataIndex: "cogsValue",
    key: "cogsValue",
    align: "right",
    width: 150,
    sorter: (a, b) => a.cogsValue - b.cogsValue,
    render: (v: number) => <Number0 value={v} />,
  },
];

// Handling batch detail columns ----------------------------------------
export const buildHandlingBatchDetailColumns = (
  rows: readonly HandlingBatchDetailRow[] = [],
  basePath = HANDLING_BASE,
): ColumnsType<HandlingBatchDetailRow> => [
  {
    title: "Batch No",
    dataIndex: "batchId",
    key: "batchId",
    width: 160,
    fixed: "left",
    sorter: (a, b) => a.batchId.localeCompare(b.batchId),
    render: (v: string) => <BatchIdLink batchId={v} basePath={basePath} />,
    ...textSearchFilter<HandlingBatchDetailRow>((r) => r.batchId, "Search Batch No"),
  },
  {
    title: "Customer Name",
    dataIndex: "customerName",
    key: "customerName",
    width: 200,
    fixed: "left",
    sorter: (a, b) => a.customerName.localeCompare(b.customerName),
    ...textSearchFilter<HandlingBatchDetailRow>((r) => r.customerName, "Search Customer"),
  },
  {
    title: "Plant Name",
    dataIndex: "plantName",
    key: "plantName",
    sorter: (a, b) => a.plantName.localeCompare(b.plantName),
    ...treeFilter<HandlingBatchDetailRow>(
      uniqueValues(rows, (r) => r.plantName),
      (r) => r.plantName,
    ),
  },
  {
    title: "Trade Contract No",
    dataIndex: "tradeContractNo",
    key: "tradeContractNo",
    width: 170,
    sorter: (a, b) => a.tradeContractNo.localeCompare(b.tradeContractNo),
    ...treeFilter<HandlingBatchDetailRow>(
      uniqueValues(rows, (r) => r.tradeContractNo),
      (r) => r.tradeContractNo,
    ),
  },
  {
    title: "TPH + CIF Coal Handling Qty",
    dataIndex: "tphCifCoalHandlingQty",
    key: "tphCifCoalHandlingQty",
    align: "right",
    width: 180,
    sorter: (a, b) => a.tphCifCoalHandlingQty - b.tphCifCoalHandlingQty,
    render: (v: number) => <Number0 value={v} />,
  },
  {
    title: "TPH Coal Handling Qty",
    dataIndex: "tphCoalHandlingQty",
    key: "tphCoalHandlingQty",
    align: "right",
    width: 170,
    sorter: (a, b) => a.tphCoalHandlingQty - b.tphCoalHandlingQty,
    render: (v: number) => <Number0 value={v} />,
  },
  {
    title: "Sagarmala Handling Calculated Qty",
    dataIndex: "sagarmalaHandlingCalculatedQty",
    key: "sagarmalaHandlingCalculatedQty",
    align: "right",
    width: 220,
    sorter: (a, b) => a.sagarmalaHandlingCalculatedQty - b.sagarmalaHandlingCalculatedQty,
    render: (v: number) => <Number0 value={v} />,
  },
  {
    title: "Sagarmala Handling Posted Qty",
    dataIndex: "sagarmalaHandlingPostedQty",
    key: "sagarmalaHandlingPostedQty",
    align: "right",
    width: 200,
    sorter: (a, b) => a.sagarmalaHandlingPostedQty - b.sagarmalaHandlingPostedQty,
    render: (v: number) => <Number0 value={v} />,
  },
];
