import { Alert, Modal, Skeleton, Space } from "antd";
import { ErrorBoundary } from "../ErrorBoundary";
import { CaseTextSection } from "./CaseTextSection";
import { CaseInformation } from "./CaseInformation";
import { legalApi } from "../../api/legal";
import { useApi } from "../../api/useApi";

interface Props {
  /** Case number to load; undefined means the modal is closed. */
  caseNo?: string;
  onClose: () => void;
}

// Case Details modal — fetches its own data by caseNo so it can be opened
// from a deep link (?case=…) without the page having to pre-load anything.
export const CaseDetailsModal = ({ caseNo, onClose }: Props) => {
  const open = Boolean(caseNo);
  const { data, isLoading, isError, error } = useApi(
    ["legal", "case", caseNo ?? ""],
    () =>
      caseNo
        ? legalApi.caseByNo(caseNo)
        : Promise.reject(new Error("no case selected")),
  );

  const title = data
    ? `Case Details - ${data.title} (Sr. No. ${data.srNo})`
    : "Case Details";

  return (
    <Modal
      open={open}
      onCancel={onClose}
      width={820}
      footer={null}
      title={title}
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
