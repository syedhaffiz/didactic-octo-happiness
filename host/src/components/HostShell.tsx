// Minimal host chrome: a top bar with nav + the signed-in user. Presentational
// only — navigation is driven by the parent via `onNavigate` (no react-router,
// since the remote owns the router), and the user name is passed in (so it
// works with or without SSO).

import type { ReactNode } from "react";
import { Layout, Menu, Space, Typography } from "antd";

const { Header, Content } = Layout;

interface Props {
  userName: string;
  active: "home" | "irm";
  onNavigate: (to: string) => void;
  children: ReactNode;
}

export const HostShell = ({ userName, active, onNavigate, children }: Props) => (
  <Layout style={{ minHeight: "100vh" }}>
    <Header style={{ display: "flex", alignItems: "center", gap: 24 }}>
      <Typography.Text strong style={{ color: "#fff", fontSize: 16 }}>
        Portal Host
      </Typography.Text>
      <Menu
        theme="dark"
        mode="horizontal"
        selectedKeys={[active]}
        style={{ flex: 1, minWidth: 0 }}
        onClick={({ key }) => onNavigate(key === "irm" ? "/irm" : "/")}
        items={[
          { key: "home", label: "Home" },
          { key: "irm", label: "IRM" },
        ]}
      />
      <Space>
        <Typography.Text style={{ color: "rgba(255,255,255,0.85)" }}>
          {userName}
        </Typography.Text>
      </Space>
    </Header>
    <Content>{children}</Content>
  </Layout>
);
