import { Button, Modal, Space } from "antd";
import { ErrorBoundary } from "../ErrorBoundary";
import { CaseTextSection } from "./CaseTextSection";
import { CaseInformation } from "./CaseInformation";
import { brand } from "../../theme/tokens";
import type { CriticalCase } from "../../types/legal";

interface Props {
  /** Case to display; undefined means the modal is closed. */
  caseData?: CriticalCase;
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

// Case Details modal — receives the row data from the table directly (no
// extra fetch). The list endpoint already carries the modal fields
// (briefFacts, currentStatus, …) on every row.
export const CaseDetailsModal = ({ caseData, onClose }: Props) => {
  const open = Boolean(caseData);
  const titleText = caseData
    ? `Case Details - ${caseData.title} (Sr. No. ${caseData.srNo})`
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
      // Tinted header bar matching the Figma.
      styles={{
        header: { background: brand.cardHeader, padding: "12px 20px", marginBottom: 0 },
        body: { padding: 20 },
      }}
      destroyOnClose
    >
      {!caseData ? null : (
        <ErrorBoundary level="section" label="case details">
          <Space direction="vertical" size={18} style={{ width: "100%" }}>
            <CaseTextSection title="Brief Facts" body={caseData.briefFacts} />
            <CaseTextSection title="Current Status" body={caseData.currentStatus} />
            <CaseInformation data={caseData} />
          </Space>
        </ErrorBoundary>
      )}
    </Modal>
  );
};
