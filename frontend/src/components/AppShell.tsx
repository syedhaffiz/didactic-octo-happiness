import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Avatar, Badge, Button, Layout, Menu, Space, Tooltip } from "antd";
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
  DownOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
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
  { key: "/logistics", icon: <TruckOutlined />, label: "Logistics" },
  { key: "/marketing", icon: <RiseOutlined />, label: "Marketing" },
  { key: "/legal", icon: <AuditOutlined />, label: "Legal" },
  { key: "/planning", icon: <ProfileOutlined />, label: "Planning" },
  { key: "/sourcing", icon: <ShoppingCartOutlined />, label: "Sourcing" },
  { key: "/customs", icon: <SafetyOutlined />, label: "Customs" },
  { key: "/commercial", icon: <ShopOutlined />, label: "Commercial" },
];

export const AppShell = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { mode, toggle } = useThemeMode();

  const selectedKeys = [location.pathname];
  const [openKeys, setOpenKeys] = useState<string[]>(["finance"]);

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
          <Space size={8} style={{ cursor: "pointer" }}>
            <Avatar
              size={28}
              icon={<UserOutlined />}
              style={{ background: brand.white, color: brand.purple }}
            />
            <span style={{ color: brand.white, fontSize: 13 }}>Hemil Mistry</span>
            <DownOutlined style={{ color: brand.white, fontSize: 10 }} />
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
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};
