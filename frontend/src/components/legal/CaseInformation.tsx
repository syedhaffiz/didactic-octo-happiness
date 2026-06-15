import { KeyValueList, type KeyValueItem } from "../KeyValueList";
import { SectionHeading } from "../SectionHeading";
import type { CriticalCase } from "../../types/legal";

// "Case Information (Sr. No. N)" block at the bottom of the modal.
export const CaseInformation = ({ data }: { data: CriticalCase }) => {
  const items: KeyValueItem[] = [
    { label: "Case Type", value: data.caseType },
    { label: "Category", value: data.category },
    { label: "Claimant", value: data.claimant.replace(/\n/g, " · ") },
    { label: "Defendant", value: data.defendant.replace(/\n/g, " · ") },
    { label: "Forum", value: data.forum },
    { label: "Claim", value: data.claim },
    { label: "Cost Incurred", value: data.costIncurred },
    { label: "Lawyer", value: data.lawyer || "—" },
    { label: "Last Date", value: data.lastDate || "—" },
    { label: "Next Date", value: data.nextDate || "—" },
  ];
  return (
    <section>
      <SectionHeading style={{ marginBottom: 10 }}>
        Case Information (Sr. No. {data.srNo})
      </SectionHeading>
      <KeyValueList items={items} />
    </section>
  );
};
