import { Flex } from "antd";
import dayjs from "dayjs";
import { StatTile } from "../../StatTile";
import { formatCrLakh, formatInr } from "../../../utils/format";
import type { IiaBillingResponse } from "../../../types/marketing";

// Placeholders rather than "NaN" / "Invalid Date" when the API omits a figure.
const fmtDate = (iso: string | null | undefined) => {
  const d = iso ? dayjs(iso) : null;
  return d?.isValid() ? d.format("DD-MMM-YY") : "—";
};
const isAmount = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);
const fmtAmount = (v: unknown) => (isAmount(v) ? formatCrLakh(v) : "—");
const fmtAmountFull = (v: unknown) => (isAmount(v) ? formatInr(v) : undefined);

interface Props {
  data?: IiaBillingResponse;
  loading: boolean;
}

// Yesterday Billing + Total Billing tiles above the table. Both are derived by
// the API from the current filter selection. Values read in Cr (a sub-crore
// figure in lakhs); the full rupee value is on hover.
export const IiaBillingSummaryTiles = ({ data, loading }: Props) => {
  const busy = loading || !data;
  return (
    <Flex gap={16} wrap style={{ marginBottom: 16 }}>
      <div style={{ flex: "0 1 240px" }}>
        <StatTile
          label="Yesterday Billing"
          value={fmtAmount(data?.yesterdayBilling)}
          tooltip={fmtAmountFull(data?.yesterdayBilling)}
          caption={`Dated: ${fmtDate(data?.yesterdayDate)}`}
          info="Billing on the most recent billing date in the current selection."
          loading={busy}
        />
      </div>
      <div style={{ flex: "0 1 240px" }}>
        <StatTile
          label="Total Billing"
          value={fmtAmount(data?.totalBilling)}
          tooltip={fmtAmountFull(data?.totalBilling)}
          caption={`Last Updated: ${fmtDate(data?.lastUpdated)}`}
          info="Total billing across all rows in the current selection."
          loading={busy}
        />
      </div>
    </Flex>
  );
};
