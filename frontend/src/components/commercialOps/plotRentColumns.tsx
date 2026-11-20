import { Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import { brand } from "../../theme/tokens";
import { textSearchFilter, treeFilter } from "../columnFilters";
import { DASH, formatAmount, formatRupeesExact, formatShortDate, textOr } from "./contractsFormat";
import type { PlotRentEntry } from "../../types/plotRent";

const str = (v: string | null | undefined) => v ?? "";
const num = (v: number | null | undefined) =>
  typeof v === "number" && Number.isFinite(v) ? v : -Infinity;

/** Distinct, sorted, non-empty values — column filter options from the live rows. */
const optionsOf = (rows: readonly PlotRentEntry[], get: (r: PlotRentEntry) => string | null) =>
  [...new Set(rows.map(get).filter((v): v is string => !!v))].sort((a, b) => a.localeCompare(b));

// Plot Rent ledger columns: Plant / Port / Name of offsetting account /
// Valuated amount / Value Date. Every cell goes through a null-safe formatter.
export const buildPlotRentColumns = (
  rows: readonly PlotRentEntry[],
): ColumnsType<PlotRentEntry> => [
  {
    key: "plant",
    title: "Plant",
    width: 110,
    sorter: (a, b) => str(a.plant).localeCompare(str(b.plant)),
    ...treeFilter<PlotRentEntry>(optionsOf(rows, (r) => r.plant), (r) => str(r.plant)),
    render: (_, r) => textOr(r.plant),
  },
  {
    key: "port",
    title: "Port",
    width: 180,
    sorter: (a, b) => str(a.port).localeCompare(str(b.port)),
    ...treeFilter<PlotRentEntry>(optionsOf(rows, (r) => r.port), (r) => str(r.port)),
    render: (_, r) => textOr(r.port),
  },
  {
    key: "accountName",
    title: "Name of offsetting account",
    sorter: (a, b) => str(a.accountName).localeCompare(str(b.accountName)),
    ...textSearchFilter<PlotRentEntry>((r) => str(r.accountName), "Search account"),
    render: (_, r) => textOr(r.accountName),
  },
  {
    key: "valuatedAmount",
    title: "Valuated amount",
    width: 180,
    align: "right",
    sorter: (a, b) => num(a.valuatedAmount) - num(b.valuatedAmount),
    render: (_, r) => {
      const text = formatAmount(r.valuatedAmount);
      if (text === DASH) return DASH;
      return (
        <Tooltip title={formatRupeesExact(r.valuatedAmount)}>
          <span style={(r.valuatedAmount ?? 0) < 0 ? { color: brand.danger } : undefined}>
            {text}
          </span>
        </Tooltip>
      );
    },
  },
  {
    key: "valueDate",
    title: "Value Date",
    width: 140,
    align: "center",
    defaultSortOrder: "descend",
    sorter: (a, b) => str(a.valueDate).localeCompare(str(b.valueDate)),
    render: (_, r) => formatShortDate(r.valueDate),
  },
];
