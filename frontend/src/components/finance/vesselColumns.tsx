import type { ColumnsType } from "antd/es/table";
import { BatchIdLink } from "./BatchIdLink";
import { brand } from "../../theme/tokens";
import type { VesselHandlingRow, VesselSalesRow } from "../../types/finance";

const VESSEL_BASE = "/finance/overview/profitability/vessels";

// Cell-only helpers ------------------------------------------------------

const VesselCell = ({ value }: { value: string }) => (
  <span style={{ color: brand.headline, fontWeight: 600 }}>{value}</span>
);

const NumberCell = ({ value }: { value: number }) =>
  Number.isFinite(value) ? <>{value.toLocaleString()}</> : <>—</>;

// Sales tab columns -----------------------------------------------------
export const buildVesselSalesColumns = (
  basePath = VESSEL_BASE,
): ColumnsType<VesselSalesRow> => [
  {
    title: "Batch ID",
    dataIndex: "batchId",
    key: "batchId",
    width: 160,
    sorter: (a, b) => a.batchId.localeCompare(b.batchId),
    render: (v: string) => <BatchIdLink batchId={v} basePath={basePath} />,
  },
  {
    title: "Vessel",
    dataIndex: "vessel",
    key: "vessel",
    sorter: (a, b) => a.vessel.localeCompare(b.vessel),
    render: (v: string) => <VesselCell value={v} />,
  },
  {
    title: "Segment",
    dataIndex: "segment",
    key: "segment",
    width: 140,
    sorter: (a, b) => a.segment.localeCompare(b.segment),
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
    width: 130,
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
    render: (v: number) => <NumberCell value={v} />,
  },
];

// Handling tab columns --------------------------------------------------
export const buildVesselHandlingColumns = (
  basePath = VESSEL_BASE,
): ColumnsType<VesselHandlingRow> => [
  {
    title: "Batch ID",
    dataIndex: "batchId",
    key: "batchId",
    width: 160,
    sorter: (a, b) => a.batchId.localeCompare(b.batchId),
    render: (v: string) => <BatchIdLink batchId={v} basePath={basePath} />,
  },
  {
    title: "Vessel",
    dataIndex: "vessel",
    key: "vessel",
    sorter: (a, b) => a.vessel.localeCompare(b.vessel),
    render: (v: string) => <VesselCell value={v} />,
  },
  {
    title: "Grade",
    dataIndex: "grade",
    key: "grade",
    width: 150,
    sorter: (a, b) => a.grade.localeCompare(b.grade),
  },
  {
    title: "Origin",
    dataIndex: "origin",
    key: "origin",
    width: 100,
    sorter: (a, b) => a.origin.localeCompare(b.origin),
  },
  {
    title: "Port",
    dataIndex: "port",
    key: "port",
    width: 130,
    sorter: (a, b) => a.port.localeCompare(b.port),
  },
  {
    title: "Segment",
    dataIndex: "segment",
    key: "segment",
    width: 140,
    sorter: (a, b) => a.segment.localeCompare(b.segment),
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
    width: 130,
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
    render: (v: number) => <NumberCell value={v} />,
  },
];
