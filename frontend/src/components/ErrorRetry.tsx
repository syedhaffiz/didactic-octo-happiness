import { Alert } from "antd";

// Shared error banner with a Retry link. Used wherever a `useApi` call can fail
// (Finance, Inventory, Marketing, …) — replaces the inline Alert+Retry that was
// duplicated across pages.
export const ErrorRetry = ({
  title,
  error,
  onRetry,
}: {
  title: string;
  error: unknown;
  onRetry: () => void;
}) => (
  <Alert
    type="error"
    showIcon
    title={title}
    description={error instanceof Error ? error.message : "Unknown error"}
    action={
      <a onClick={onRetry} style={{ cursor: "pointer" }}>
        Retry
      </a>
    }
  />
);
