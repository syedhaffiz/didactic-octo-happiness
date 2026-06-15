import type { ColumnsType } from "antd/es/table";
import { Button } from "antd";
import { ExportOutlined } from "@ant-design/icons";
import type { CriticalCase } from "../../types/legal";
import { brand } from "../../theme/tokens";

// Multi-line cell — many table values from the Figma carry literal newlines
// (e.g. "(S. 34)\nWBPDCL\n…") which would otherwise collapse to one line.
const MultiLine = ({ value }: { value: string }) => (
  <span style={{ whiteSpace: "pre-line" }}>{value}</span>
);

const Category = ({ value }: { value: string }) => (
  <span style={{ color: brand.accent, fontWeight: 600 }}>{value}</span>
);

const DetailsButton = ({ onClick }: { onClick: () => void }) => (
  <Button
    type="primary"
    size="small"
    onClick={onClick}
    icon={<ExportOutlined />}
    iconPosition="end"
  >
    Details
  </Button>
);

interface BuildOpts {
  onOpenDetails: (row: CriticalCase) => void;
}

// Column definitions for the Critical Cases table. Pulled out so the page is
// thin and the columns are independently testable / overridable.
export const buildCriticalCasesColumns = ({
  onOpenDetails,
}: BuildOpts): ColumnsType<CriticalCase> => [
  // Sr No + Case No stay pinned to the left while the rest scrolls.
  { title: "Sr No", dataIndex: "srNo", key: "srNo", width: 70, fixed: "left" },
  { title: "Case No", dataIndex: "caseNo", key: "caseNo", width: 140, fixed: "left" },
  {
    title: "Category",
    dataIndex: "category",
    key: "category",
    width: 100,
    render: (v: string) => <Category value={v} />,
  },
  {
    title: "Claimant/ Petitioner",
    dataIndex: "claimant",
    key: "claimant",
    width: 130,
    render: (v: string) => <MultiLine value={v} />,
  },
  {
    title: "Defendant/ Respondent",
    dataIndex: "defendant",
    key: "defendant",
    width: 130,
    render: (v: string) => <MultiLine value={v} />,
  },
  { title: "Forum", dataIndex: "forum", key: "forum", width: 220 },
  { title: "Claim", dataIndex: "claim", key: "claim", width: 130 },
  { title: "Cost Incurred", dataIndex: "costIncurred", key: "costIncurred", width: 130 },
  { title: "Lawyer", dataIndex: "lawyer", key: "lawyer", width: 170 },
  { title: "Last Date", dataIndex: "lastDate", key: "lastDate", width: 100 },
  { title: "Next Date", dataIndex: "nextDate", key: "nextDate", width: 100 },
  {
    title: "Details",
    key: "details",
    width: 120,
    render: (_: unknown, row: CriticalCase) => (
      <DetailsButton onClick={() => onOpenDetails(row)} />
    ),
  },
];
