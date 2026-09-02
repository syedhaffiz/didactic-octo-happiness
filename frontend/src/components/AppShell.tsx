import { Suspense } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Avatar, Badge, Button, Layout, Skeleton, Space, Tooltip } from "antd";
import { useIdentity } from "../auth/AuthProvider";
import { ErrorBoundary } from "./ErrorBoundary";
import { BellOutlined, BulbOutlined, UserOutlined, MoonOutlined } from "@ant-design/icons";
import { Logo } from "./Logo";
import { SideNav } from "./SideNav";
import { useThemeMode } from "../theme/themeContext";
import { brand } from "../theme/tokens";

const { Header, Sider, Content } = Layout;

export const AppShell = () => {
  const location = useLocation();
  const { mode, toggle } = useThemeMode();
  // Display name of the silently signed-in account (or a placeholder when the
  // remote runs without auth env / no active session). Sign-out is the host's
  // responsibility — the remote has no sign-out.
  const { name: accountName } = useIdentity();

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
          background: mode === "light" ? brand.gradient : brand.gradientDark,
        }}
      >
        <Logo />
        <Space size="large">
          <Badge dot offset={[-2, 2]}>
            <BellOutlined style={{ color: brand.white, fontSize: 18 }} />
          </Badge>
          <Tooltip title={mode === "light" ? "Switch to dark mode" : "Switch to light mode"}>
            <Button
              type="text"
              icon={
                mode === "light" ? (
                  <BulbOutlined style={{ color: brand.white, fontSize: 18 }} />
                ) : (
                  <MoonOutlined style={{ color: brand.white, fontSize: 18 }} />
                )
              }
              onClick={toggle}
            />
          </Tooltip>
          <Space size={8}>
            <Avatar
              size={28}
              icon={<UserOutlined />}
              style={{ background: brand.white, color: brand.purple }}
            />
            <span style={{ color: brand.white, fontSize: 13 }}>{accountName}</span>
          </Space>
        </Space>
      </Header>
      <Layout>
        <Sider width={104} theme="light" style={{ paddingTop: 8 }}>
          <SideNav />
        </Sider>
        <Content style={{ padding: 24 }}>
          {/* Reset on route change so navigating away from a crashed page
              clears the error automatically. */}
          <ErrorBoundary resetKeys={[location.pathname]}>
            <Suspense fallback={<Skeleton active paragraph={{ rows: 8 }} />}>
              <Outlet />
            </Suspense>
          </ErrorBoundary>
        </Content>
      </Layout>
    </Layout>
  );
};
