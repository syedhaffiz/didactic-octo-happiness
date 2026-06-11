import { Suspense, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Avatar,
  Badge,
  Button,
  Layout,
  Menu,
  Skeleton,
  Space,
  Tooltip,
} from "antd";
import { useIdentity } from "../auth/AuthProvider";
import { ErrorBoundary } from "./ErrorBoundary";
import {
  BellOutlined,
  BulbOutlined,
  BankOutlined,
  AuditOutlined,
  ProfileOutlined,
  ShoppingCartOutlined,
  TruckOutlined,
  RiseOutlined,
  SafetyOutlined,
  UserOutlined,
  ShopOutlined,
  MoonOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SettingOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Logo } from "./Logo";
import { useThemeMode } from "../theme/themeContext";
import { brand } from "../theme/tokens";

const { Header, Sider, Content } = Layout;

const menuItems: MenuProps["items"] = [
  {
    key: "finance",
    icon: <BankOutlined />,
    label: "Finance",
    children: [
      { key: "/finance/overview", label: "Overview" },
      { key: "/finance/sales", label: "Sales" },
      { key: "/finance/approved-budget", label: "Approved Budget" },
    ],
  },
  { key: "/inventory/index", icon: <InboxOutlined />, label: "Inventory" },
  { key: "/logistics", icon: <TruckOutlined />, label: "Logistics" },
  {
    key: "marketing",
    icon: <RiseOutlined />,
    label: "Marketing",
    children: [
      { key: "/marketing/index-movement", label: "Index Movement" },
      { key: "/marketing/market-share", label: "Market Share" },
      { key: "/marketing/ocean-freight", label: "Ocean Freight" },
      { key: "/marketing/target", label: "Target above 2%" },
    ],
  },
  { key: "/legal", icon: <AuditOutlined />, label: "Legal" },
  { key: "/planning", icon: <ProfileOutlined />, label: "Planning" },
  { key: "/sourcing", icon: <ShoppingCartOutlined />, label: "Sourcing" },
  { key: "/customs", icon: <SafetyOutlined />, label: "Customs" },
  { key: "/commercial", icon: <ShopOutlined />, label: "Commercial" },
  { type: "divider" },
  { key: "/settings", icon: <SettingOutlined />, label: "Settings" },
];

export const AppShell = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { mode, toggle } = useThemeMode();
  // Display name of the silently signed-in account (or a placeholder when the
  // remote runs without auth env / no active session). Sign-out is the host's
  // responsibility — the remote has no sign-out.
  const { name: accountName } = useIdentity();

  // Normalise inventory paths to the parent menu key so any tab highlights the item.
  const selectedKeys = [
    location.pathname.startsWith("/inventory") ? "/inventory/index" : location.pathname,
  ];
  const [openKeys, setOpenKeys] = useState<string[]>(() =>
    location.pathname.startsWith("/marketing") ? ["marketing"] : ["finance"],
  );

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
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          width={224}
          collapsedWidth={72}
          breakpoint="lg"
          theme="light"
          trigger={null}
        >
          <div
            style={{
              display: "flex",
              justifyContent: collapsed ? "center" : "flex-end",
              padding: "10px 12px",
            }}
          >
            <Button
              type="text"
              size="small"
              aria-label="Toggle sidebar"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed((v) => !v)}
              style={{ color: brand.textMuted }}
            />
          </div>
          <Menu
            mode="inline"
            selectedKeys={selectedKeys}
            openKeys={openKeys}
            onOpenChange={(keys) => setOpenKeys(keys as string[])}
            items={menuItems}
            onClick={({ key }) => {
              if (key.startsWith("/")) navigate(key);
            }}
            style={{ borderInlineEnd: "none", padding: "0 10px" }}
          />
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
