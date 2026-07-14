import type { ColumnsType } from "antd/es/table";
import { BatchIdLink } from "./BatchIdLink";
import { textSearchFilter, treeFilter, uniqueValues } from "../columnFilters";
import { brand } from "../../theme/tokens";
import type { VesselHandlingRow, VesselSalesRow } from "../../types/finance";

// One builder per table, even where two tables currently show the same columns
// (Handling All / Sagarmala / CIF). The sets are expected to diverge, and a
// shared builder would have to be torn apart the first time one of them changes
// — so they are kept separate and the duplication is deliberate.

const SALES_BASE = "/finance/overview/profitability/vessels/sales";
const HANDLING_BASE = "/finance/overview/profitability/vessels/handling";

// Cell-only helpers ------------------------------------------------------

const VesselCell = ({ value }: { value: string }) => (
  <span style={{ color: brand.headline, fontWeight: 600 }}>{value}</span>
);

const NumberCell = ({ value }: { value: number }) =>
  Number.isFinite(value) ? <>{value.toLocaleString()}</> : <>—</>;

// Per-MT figures — always two decimals, so a column of them reads as a column.
const DecimalCell = ({ value }: { value: number }) =>
  Number.isFinite(value) ? (
    <>{value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</>
  ) : (
    <>—</>
  );

// Sales tab -------------------------------------------------------------
export const buildVesselSalesColumns = (
  rows: readonly VesselSalesRow[] = [],
  basePath = SALES_BASE,
): ColumnsType<VesselSalesRow> => [
  {
    title: "Batch ID",
    dataIndex: "batchId",
    key: "batchId",
    width: 160,
    fixed: "left",
    sorter: (a, b) => a.batchId.localeCompare(b.batchId),
    render: (v: string) => <BatchIdLink batchId={v} basePath={basePath} />,
    ...textSearchFilter<VesselSalesRow>((r) => r.batchId, "Search Batch ID"),
  },
  {
    title: "Vessel",
    dataIndex: "vessel",
    key: "vessel",
    width: 200,
    fixed: "left",
    sorter: (a, b) => a.vessel.localeCompare(b.vessel),
    render: (v: string) => <VesselCell value={v} />,
    ...textSearchFilter<VesselSalesRow>((r) => r.vessel, "Search Vessel"),
  },
  {
    title: "Segment",
    dataIndex: "segment",
    key: "segment",
    width: 140,
    sorter: (a, b) => a.segment.localeCompare(b.segment),
    ...treeFilter<VesselSalesRow>(uniqueValues(rows, (r) => r.segment), (r) => r.segment),
  },
  {
    title: "Volume",
    dataIndex: "volume",
    key: "volume",
    align: "right",
    width: 120,
    sorter: (a, b) => a.volume - b.volume,
    render: (v: number) => <NumberCell value={v} />,
  },
  {
    title: "Revenue",
    dataIndex: "revenue",
    key: "revenue",
    align: "right",
    width: 140,
    sorter: (a, b) => a.revenue - b.revenue,
    render: (v: number) => <NumberCell value={v} />,
  },
  {
    title: "Rev / MT",
    dataIndex: "revPerMt",
    key: "revPerMt",
    align: "right",
    width: 130,
    sorter: (a, b) => a.revPerMt - b.revPerMt,
    render: (v: number) => <DecimalCell value={v} />,
  },
  {
    title: "Profit",
    dataIndex: "profit",
    key: "profit",
    align: "right",
    width: 140,
    sorter: (a, b) => a.profit - b.profit,
    render: (v: number) => <NumberCell value={v} />,
  },
  {
    title: "Profit / MT",
    dataIndex: "profitPerMt",
    key: "profitPerMt",
    align: "right",
    width: 130,
    sorter: (a, b) => a.profitPerMt - b.profitPerMt,
    render: (v: number) => <DecimalCell value={v} />,
  },
  {
    title: "Profit / MT USD",
    dataIndex: "profitPerMtUsd",
    key: "profitPerMtUsd",
    align: "right",
    width: 150,
    sorter: (a, b) => a.profitPerMtUsd - b.profitPerMtUsd,
    render: (v: number) => <DecimalCell value={v} />,
  },
];

// Handling tab — All ----------------------------------------------------
export const buildHandlingAllColumns = (
  rows: readonly VesselHandlingRow[] = [],
  basePath = HANDLING_BASE,
): ColumnsType<VesselHandlingRow> => [
  {
    title: "Batch ID",
    dataIndex: "batchId",
    key: "batchId",
    width: 160,
    fixed: "left",
    sorter: (a, b) => a.batchId.localeCompare(b.batchId),
    render: (v: string) => <BatchIdLink batchId={v} basePath={basePath} />,
    ...textSearchFilter<VesselHandlingRow>((r) => r.batchId, "Search Batch ID"),
  },
  {
    title: "Vessel",
    dataIndex: "vessel",
    key: "vessel",
    width: 200,
    fixed: "left",
    sorter: (a, b) => a.vessel.localeCompare(b.vessel),
    render: (v: string) => <VesselCell value={v} />,
    ...textSearchFilter<VesselHandlingRow>((r) => r.vessel, "Search Vessel"),
  },
  {
    title: "Customer",
    dataIndex: "customer",
    key: "customer",
    width: 180,
    sorter: (a, b) => a.customer.localeCompare(b.customer),
    ...treeFilter<VesselHandlingRow>(uniqueValues(rows, (r) => r.customer), (r) => r.customer),
  },
  {
    title: "Volume",
    dataIndex: "volume",
    key: "volume",
    align: "right",
    width: 120,
    sorter: (a, b) => a.volume - b.volume,
    render: (v: number) => <NumberCell value={v} />,
  },
  {
    title: "Profit",
    dataIndex: "profit",
    key: "profit",
    align: "right",
    width: 140,
    sorter: (a, b) => a.profit - b.profit,
    render: (v: number) => <NumberCell value={v} />,
  },
  {
    title: "PMT Profit",
    dataIndex: "pmtProfit",
    key: "pmtProfit",
    align: "right",
    width: 130,
    sorter: (a, b) => a.pmtProfit - b.pmtProfit,
    render: (v: number) => <DecimalCell value={v} />,
  },
];

// Handling tab — Sagarmala ----------------------------------------------
export const buildHandlingSagarmalaColumns = (
  rows: readonly VesselHandlingRow[] = [],
  basePath = HANDLING_BASE,
): ColumnsType<VesselHandlingRow> => [
  {
    title: "Batch ID",
    dataIndex: "batchId",
    key: "batchId",
    width: 160,
    fixed: "left",
    sorter: (a, b) => a.batchId.localeCompare(b.batchId),
    render: (v: string) => <BatchIdLink batchId={v} basePath={basePath} />,
    ...textSearchFilter<VesselHandlingRow>((r) => r.batchId, "Search Batch ID"),
  },
  {
    title: "Vessel",
    dataIndex: "vessel",
    key: "vessel",
    width: 200,
    fixed: "left",
    sorter: (a, b) => a.vessel.localeCompare(b.vessel),
    render: (v: string) => <VesselCell value={v} />,
    ...textSearchFilter<VesselHandlingRow>((r) => r.vessel, "Search Vessel"),
  },
  {
    title: "Customer",
    dataIndex: "customer",
    key: "customer",
    width: 180,
    sorter: (a, b) => a.customer.localeCompare(b.customer),
    ...treeFilter<VesselHandlingRow>(uniqueValues(rows, (r) => r.customer), (r) => r.customer),
  },
  {
    title: "Volume",
    dataIndex: "volume",
    key: "volume",
    align: "right",
    width: 120,
    sorter: (a, b) => a.volume - b.volume,
    render: (v: number) => <NumberCell value={v} />,
  },
  {
    title: "Profit",
    dataIndex: "profit",
    key: "profit",
    align: "right",
    width: 140,
    sorter: (a, b) => a.profit - b.profit,
    render: (v: number) => <NumberCell value={v} />,
  },
  {
    title: "PMT Profit",
    dataIndex: "pmtProfit",
    key: "pmtProfit",
    align: "right",
    width: 130,
    sorter: (a, b) => a.pmtProfit - b.pmtProfit,
    render: (v: number) => <DecimalCell value={v} />,
  },
];

// Handling tab — TPH (Port where the others show Customer) ---------------
export const buildHandlingTphColumns = (
  rows: readonly VesselHandlingRow[] = [],
  basePath = HANDLING_BASE,
): ColumnsType<VesselHandlingRow> => [
  {
    title: "Batch ID",
    dataIndex: "batchId",
    key: "batchId",
    width: 160,
    fixed: "left",
    sorter: (a, b) => a.batchId.localeCompare(b.batchId),
    render: (v: string) => <BatchIdLink batchId={v} basePath={basePath} />,
    ...textSearchFilter<VesselHandlingRow>((r) => r.batchId, "Search Batch ID"),
  },
  {
    title: "Vessel",
    dataIndex: "vessel",
    key: "vessel",
    width: 200,
    fixed: "left",
    sorter: (a, b) => a.vessel.localeCompare(b.vessel),
    render: (v: string) => <VesselCell value={v} />,
    ...textSearchFilter<VesselHandlingRow>((r) => r.vessel, "Search Vessel"),
  },
  {
    title: "Port",
    dataIndex: "port",
    key: "port",
    width: 180,
    sorter: (a, b) => a.port.localeCompare(b.port),
    ...treeFilter<VesselHandlingRow>(uniqueValues(rows, (r) => r.port), (r) => r.port),
  },
  {
    title: "Volume",
    dataIndex: "volume",
    key: "volume",
    align: "right",
    width: 120,
    sorter: (a, b) => a.volume - b.volume,
    render: (v: number) => <NumberCell value={v} />,
  },
  {
    title: "Profit",
    dataIndex: "profit",
    key: "profit",
    align: "right",
    width: 140,
    sorter: (a, b) => a.profit - b.profit,
    render: (v: number) => <NumberCell value={v} />,
  },
  {
    title: "PMT Profit",
    dataIndex: "pmtProfit",
    key: "pmtProfit",
    align: "right",
    width: 130,
    sorter: (a, b) => a.pmtProfit - b.pmtProfit,
    render: (v: number) => <DecimalCell value={v} />,
  },
];

// Handling tab — CIF ----------------------------------------------------
export const buildHandlingCifColumns = (
  rows: readonly VesselHandlingRow[] = [],
  basePath = HANDLING_BASE,
): ColumnsType<VesselHandlingRow> => [
  {
    title: "Batch ID",
    dataIndex: "batchId",
    key: "batchId",
    width: 160,
    fixed: "left",
    sorter: (a, b) => a.batchId.localeCompare(b.batchId),
    render: (v: string) => <BatchIdLink batchId={v} basePath={basePath} />,
    ...textSearchFilter<VesselHandlingRow>((r) => r.batchId, "Search Batch ID"),
  },
  {
    title: "Vessel",
    dataIndex: "vessel",
    key: "vessel",
    width: 200,
    fixed: "left",
    sorter: (a, b) => a.vessel.localeCompare(b.vessel),
    render: (v: string) => <VesselCell value={v} />,
    ...textSearchFilter<VesselHandlingRow>((r) => r.vessel, "Search Vessel"),
  },
  {
    title: "Customer",
    dataIndex: "customer",
    key: "customer",
    width: 180,
    sorter: (a, b) => a.customer.localeCompare(b.customer),
    ...treeFilter<VesselHandlingRow>(uniqueValues(rows, (r) => r.customer), (r) => r.customer),
  },
  {
    title: "Volume",
    dataIndex: "volume",
    key: "volume",
    align: "right",
    width: 120,
    sorter: (a, b) => a.volume - b.volume,
    render: (v: number) => <NumberCell value={v} />,
  },
  {
    title: "Profit",
    dataIndex: "profit",
    key: "profit",
    align: "right",
    width: 140,
    sorter: (a, b) => a.profit - b.profit,
    render: (v: number) => <NumberCell value={v} />,
  },
  {
    title: "PMT Profit",
    dataIndex: "pmtProfit",
    key: "pmtProfit",
    align: "right",
    width: 130,
    sorter: (a, b) => a.pmtProfit - b.pmtProfit,
    render: (v: number) => <DecimalCell value={v} />,
  },
];
