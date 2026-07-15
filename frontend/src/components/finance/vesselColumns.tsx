import type { ColumnsType } from "antd/es/table";
import { BatchIdLink } from "./BatchIdLink";
import { serverTextFilter } from "../columnFilters";
import { brand } from "../../theme/tokens";
import type { VesselHandlingRow, VesselSalesRow } from "../../types/finance";

// One builder per table, even where two tables currently show the same columns
// (Handling All / Sagarmala / CIF). The sets are expected to diverge, and a
// shared builder would have to be torn apart the first time one of them changes
// — so they are kept separate and the duplication is deliberate.
//
// Every text column uses `serverTextFilter`: the dropdown captures a search
// term but does NOT filter locally. FilterableTable surfaces the term through
// the Table's onChange; the page sends it to the API and the backend returns
// the matches. Numeric columns sort client-side over whatever the API returned.

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
    ...serverTextFilter<VesselSalesRow>("Search Batch ID"),
  },
  {
    title: "Vessel",
    dataIndex: "vessel",
    key: "vessel",
    width: 200,
    fixed: "left",
    sorter: (a, b) => a.vessel.localeCompare(b.vessel),
    render: (v: string) => <VesselCell value={v} />,
    ...serverTextFilter<VesselSalesRow>("Search Vessel"),
  },
  {
    title: "Segment",
    dataIndex: "segment",
    key: "segment",
    width: 140,
    sorter: (a, b) => a.segment.localeCompare(b.segment),
    ...serverTextFilter<VesselSalesRow>("Search Segment"),
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
    ...serverTextFilter<VesselHandlingRow>("Search Batch ID"),
  },
  {
    title: "Vessel",
    dataIndex: "vessel",
    key: "vessel",
    width: 200,
    fixed: "left",
    sorter: (a, b) => a.vessel.localeCompare(b.vessel),
    render: (v: string) => <VesselCell value={v} />,
    ...serverTextFilter<VesselHandlingRow>("Search Vessel"),
  },
  {
    title: "Customer",
    dataIndex: "customer",
    key: "customer",
    width: 180,
    sorter: (a, b) => a.customer.localeCompare(b.customer),
    ...serverTextFilter<VesselHandlingRow>("Search Customer"),
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
    ...serverTextFilter<VesselHandlingRow>("Search Batch ID"),
  },
  {
    title: "Vessel",
    dataIndex: "vessel",
    key: "vessel",
    width: 200,
    fixed: "left",
    sorter: (a, b) => a.vessel.localeCompare(b.vessel),
    render: (v: string) => <VesselCell value={v} />,
    ...serverTextFilter<VesselHandlingRow>("Search Vessel"),
  },
  {
    title: "Customer",
    dataIndex: "customer",
    key: "customer",
    width: 180,
    sorter: (a, b) => a.customer.localeCompare(b.customer),
    ...serverTextFilter<VesselHandlingRow>("Search Customer"),
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
    ...serverTextFilter<VesselHandlingRow>("Search Batch ID"),
  },
  {
    title: "Vessel",
    dataIndex: "vessel",
    key: "vessel",
    width: 200,
    fixed: "left",
    sorter: (a, b) => a.vessel.localeCompare(b.vessel),
    render: (v: string) => <VesselCell value={v} />,
    ...serverTextFilter<VesselHandlingRow>("Search Vessel"),
  },
  {
    title: "Port",
    dataIndex: "port",
    key: "port",
    width: 180,
    sorter: (a, b) => a.port.localeCompare(b.port),
    ...serverTextFilter<VesselHandlingRow>("Search Port"),
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
    ...serverTextFilter<VesselHandlingRow>("Search Batch ID"),
  },
  {
    title: "Vessel",
    dataIndex: "vessel",
    key: "vessel",
    width: 200,
    fixed: "left",
    sorter: (a, b) => a.vessel.localeCompare(b.vessel),
    render: (v: string) => <VesselCell value={v} />,
    ...serverTextFilter<VesselHandlingRow>("Search Vessel"),
  },
  {
    title: "Customer",
    dataIndex: "customer",
    key: "customer",
    width: 180,
    sorter: (a, b) => a.customer.localeCompare(b.customer),
    ...serverTextFilter<VesselHandlingRow>("Search Customer"),
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
