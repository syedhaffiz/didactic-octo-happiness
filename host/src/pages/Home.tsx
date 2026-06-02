import { Button, Typography } from "antd";

export const Home = ({ onOpenIrm }: { onOpenIrm: () => void }) => (
  <div style={{ padding: 32, maxWidth: 720 }}>
    <Typography.Title level={2}>Welcome to the Portal</Typography.Title>
    <Typography.Paragraph>
      This is the federation host. It owns the Microsoft sign-in for the whole
      portal. The <strong>IRM</strong> (Integrated Resource Management) app is a
      separate microfrontend loaded at runtime from its own dev server and
      mounted under <code>/irm</code> — it reuses this host's auth session, so
      no second sign-in is needed.
    </Typography.Paragraph>
    <Button type="primary" onClick={onOpenIrm}>
      Open IRM →
    </Button>
  </div>
);
