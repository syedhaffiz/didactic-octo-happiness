import { Alert, Button, Modal, Skeleton, Space } from "antd";
import { ErrorBoundary } from "../ErrorBoundary";
import { CaseTextSection } from "./CaseTextSection";
import { CaseInformation } from "./CaseInformation";
import { legalApi } from "../../api/legal";
import { useApi } from "../../api/useApi";
import { brand } from "../../theme/tokens";

interface Props {
  /** Case number to load; undefined means the modal is closed. */
  caseNo?: string;
  onClose: () => void;
}

// Header row used as the antd Modal `title`. Renders title text on the left
// and a "Back" button on the right, with the pale-blue card-header background
// applied through `styles.header` on the Modal.
const Header = ({ text, onBack }: { text: string; onBack: () => void }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 16,
    }}
  >
    <span style={{ fontWeight: 700, color: brand.headline, fontSize: 15 }}>{text}</span>
    <Button size="small" onClick={onBack}>
      Back
    </Button>
  </div>
);

// Case Details modal — fetches its own data by caseNo so it can be opened from
// a deep link (?case=…) without the page having to pre-load anything. The
// header has a tinted background, a "Back" button (no X icon), and the body
// composes three small sections.
export const CaseDetailsModal = ({ caseNo, onClose }: Props) => {
  const open = Boolean(caseNo);
  const { data, isLoading, isError, error } = useApi(
    ["legal", "case", caseNo ?? ""],
    () =>
      caseNo
        ? legalApi.caseByNo(caseNo)
        : Promise.reject(new Error("no case selected")),
  );

  const titleText = data
    ? `Case Details - ${data.title} (Sr. No. ${data.srNo})`
    : "Case Details";

  return (
    <Modal
      open={open}
      onCancel={onClose}
      width={820}
      footer={null}
      // We render our own "Back" button inside `title`, so suppress antd's
      // default close icon entirely.
      closable={false}
      title={<Header text={titleText} onBack={onClose} />}
      // Tinted header bar matching the Figma. Padding is bumped slightly so
      // the title + Back button breathe.
      styles={{
        header: { background: brand.cardHeader, padding: "12px 20px", marginBottom: 0 },
        body: { padding: 20 },
      }}
      destroyOnClose
    >
      {!caseNo ? null : isLoading || !data ? (
        <Skeleton active paragraph={{ rows: 10 }} />
      ) : isError ? (
        <Alert
          type="error"
          showIcon
          title="Could not load case details"
          description={error instanceof Error ? error.message : "Unknown error"}
        />
      ) : (
        <ErrorBoundary level="section" label="case details">
          <Space direction="vertical" size={18} style={{ width: "100%" }}>
            <CaseTextSection title="Brief Facts" body={data.briefFacts} />
            <CaseTextSection title="Current Status" body={data.currentStatus} />
            <CaseInformation data={data} />
          </Space>
        </ErrorBoundary>
      )}
    </Modal>
  );
};
