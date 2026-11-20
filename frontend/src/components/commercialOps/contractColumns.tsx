import type { ColumnsType } from "antd/es/table";
import { brand } from "../../theme/tokens";
import { textSearchFilter, treeFilter } from "../columnFilters";
import { Amount, CellPair, HeadPair } from "./ContractCells";
import {
  DASH,
  formatAmount,
  formatPostingDate,
  formatQty,
  textOr,
} from "./contractsFormat";
import type { ContractRow } from "../../types/commercialOps";

const num = (v: number | null | undefined) => (typeof v === "number" && Number.isFinite(v) ? v : -Infinity);
const str = (v: string | null | undefined) => v ?? "";

/** Distinct, sorted, non-empty values of `get` across `rows` — column filter options. */
const optionsOf = (rows: readonly ContractRow[], get: (r: ContractRow) => string | null) =>
  [...new Set(rows.map(get).filter((v): v is string => !!v))].sort((a, b) => a.localeCompare(b));

export const buildContractColumns = (rows: readonly ContractRow[]): ColumnsType<ContractRow> => [
  {
    key: "tcNo",
    title: <HeadPair top="TC No" bottom="Posting Date" />,
    fixed: "left",
    width: 140,
    sorter: (a, b) => str(a.tcNo).localeCompare(str(b.tcNo)),
    ...textSearchFilter<ContractRow>((r) => str(r.tcNo), "Search TC No"),
    render: (_, r) => (
      <CellPair
        top={textOr(r.tcNo)}
        topStyle={{ fontWeight: 600, color: brand.headline }}
        bottom={formatPostingDate(r.postingDate)}
      />
    ),
  },
  {
    key: "customer",
    title: <HeadPair top="Customer" bottom="Segment" />,
    width: 240,
    sorter: (a, b) => str(a.customer).localeCompare(str(b.customer)),
    ...textSearchFilter<ContractRow>((r) => str(r.customer), "Search customer"),
    render: (_, r) => <CellPair top={textOr(r.customer)} bottom={textOr(r.segment)} />,
  },
  {
    key: "plant",
    title: <HeadPair top="Plant" bottom="Trader" />,
    width: 190,
    ...treeFilter<ContractRow>(optionsOf(rows, (r) => r.plant), (r) => str(r.plant)),
    render: (_, r) => <CellPair top={textOr(r.plant)} bottom={textOr(r.trader)} />,
  },
  {
    key: "openQty",
    title: <HeadPair top="Open Qty" bottom="Open TC Qty" />,
    width: 120,
    align: "right",
    sorter: (a, b) => num(a.openQty) - num(b.openQty),
    render: (_, r) => <CellPair top={formatQty(r.openQty)} bottom={formatQty(r.openTcQty)} />,
  },
  {
    key: "country",
    title: <HeadPair top="Country · GAR/NAR" bottom="Mine" />,
    width: 160,
    ...treeFilter<ContractRow>(optionsOf(rows, (r) => r.country), (r) => str(r.country)),
    render: (_, r) => (
      <CellPair
        top={`${textOr(r.country)} · ${r.gar ?? DASH}`}
        bottom={textOr(r.mine)}
      />
    ),
  },
  {
    key: "tcRate",
    title: <HeadPair top="TC Rate" bottom="M2M Rate" />,
    width: 120,
    align: "right",
    sorter: (a, b) => num(a.tcRate) - num(b.tcRate),
    render: (_, r) => <CellPair top={formatAmount(r.tcRate)} bottom={formatAmount(r.m2mRate)} />,
  },
  {
    key: "m2mValue",
    title: <HeadPair top="M2M Value" bottom="TC Value" />,
    width: 160,
    align: "right",
    sorter: (a, b) => num(a.m2mValue) - num(b.m2mValue),
    render: (_, r) => <CellPair top={<Amount value={r.m2mValue} />} bottom={<Amount value={r.tcValue} />} />,
  },
  {
    key: "emdAmount",
    title: <HeadPair top="EMD Amount" bottom="Status · Aging" />,
    width: 150,
    align: "right",
    sorter: (a, b) => num(a.emdAmount) - num(b.emdAmount),
    render: (_, r) => (
      <CellPair
        top={<Amount value={r.emdAmount} />}
        bottom={`${r.emdStatus ?? DASH} · ${
          typeof r.emdAgingDays === "number" ? `${r.emdAgingDays}d` : DASH
        }`}
        bottomTitle={
          typeof r.emdAgingDays === "number" ? `EMD pending for ${r.emdAgingDays} days` : undefined
        }
      />
    ),
  },
  {
    key: "status",
    title: "Remarks",
    width: 190,
    ...treeFilter<ContractRow>(optionsOf(rows, (r) => r.status), (r) => str(r.status)),
    render: (_, r) => textOr(r.status),
  },
];
