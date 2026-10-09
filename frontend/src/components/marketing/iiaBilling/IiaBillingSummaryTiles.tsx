import { Flex } from "antd";
import dayjs from "dayjs";
import { StatTile } from "../../StatTile";
import { formatCrLakh, formatInr } from "../../../utils/format";
import type { IiaBillingResponse } from "../../../types/marketing";

const fmtDate = (iso: string | null) => (iso ? dayjs(iso).format("DD-MMM-YY") : "—");

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
          value={data ? formatCrLakh(data.yesterdayBilling) : null}
          tooltip={data ? formatInr(data.yesterdayBilling) : undefined}
          caption={`Dated: ${fmtDate(data?.yesterdayDate ?? null)}`}
          info="Billing on the most recent billing date in the current selection."
          loading={busy}
        />
      </div>
      <div style={{ flex: "0 1 240px" }}>
        <StatTile
          label="Total Billing"
          value={data ? formatCrLakh(data.totalBilling) : null}
          tooltip={data ? formatInr(data.totalBilling) : undefined}
          caption={`Last Updated: ${fmtDate(data?.lastUpdated ?? null)}`}
          info="Total billing across all rows in the current selection."
          loading={busy}
        />
      </div>
    </Flex>
  );
};
