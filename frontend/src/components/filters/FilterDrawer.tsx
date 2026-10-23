import type { ReactNode } from "react";
import { Button, Drawer, Space } from "antd";

interface Props {
  open: boolean;
  onClose: () => void;
  /** Commit the drawer's draft (the caller closes / commits as it sees fit). */
  onApply: () => void;
  /** Empty the draft — does not commit until Apply. */
  onClearAll: () => void;
  children: ReactNode;
}

// Shared slide-in "Filters" side-panel chrome: title, "Clear all" link, and a
// Cancel / Apply footer. Callers own the draft state and render the fields as
// children, laid out in a vertical stack.
export const FilterDrawer = ({ open, onClose, onApply, onClearAll, children }: Props) => (
  <Drawer
    title="Filters"
    open={open}
    onClose={onClose}
    extra={
      <a onClick={onClearAll} style={{ cursor: "pointer" }}>
        Clear all
      </a>
    }
    footer={
      <Space style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button type="primary" onClick={onApply}>
          Apply filters
        </Button>
      </Space>
    }
  >
    <Space orientation="vertical" size="middle" style={{ width: "100%" }}>
      {children}
    </Space>
  </Drawer>
);
