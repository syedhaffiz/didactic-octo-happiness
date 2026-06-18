import { Suspense, useEffect, useMemo, useState } from "react";
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

// Walks menuItems to find the submenu (a parent with `children`) that
// contains a given leaf key. Returns the submenu's key, or null if the leaf
// is a top-level item with no parent. Used to keep `openKeys` in lockstep
// with the active route — leaf clicks naturally collapse other open
// submenus.
type MenuChild = { key?: React.Key; children?: MenuChild[] };
const findParentSubmenuFor = (
  items: MenuProps["items"],
  targetKey: string,
): string | null => {
  for (const item of items ?? []) {
    if (!item) continue;
    const node = item as MenuChild;
    if (!node.children) continue;
    for (const child of node.children) {
      if (child && String(child.key) === targetKey) {
        return node.key !== undefined ? String(node.key) : null;
      }
    }
  }
  return null;
};

export const AppShell = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { mode, toggle } = useThemeMode();
  // Display name of the silently signed-in account (or a placeholder when the
  // remote runs without auth env / no active session). Sign-out is the host's
  // responsibility — the remote has no sign-out.
  const { name: accountName } = useIdentity();

  // Normalise certain paths to the parent menu key so any sub-page highlights
  // the right item in the sidebar.
  const selectedKey =
    location.pathname.startsWith("/inventory")
      ? "/inventory/index"
      : location.pathname.startsWith("/finance/overview")
        ? "/finance/overview"
        : location.pathname;
  const selectedKeys = [selectedKey];

  // The submenu (if any) that contains the active route. Derived from
  // menuItems so we don't hardcode a path → submenu map.
  const activeParentSubmenu = useMemo(
    () => findParentSubmenuFor(menuItems, selectedKey),
    [selectedKey],
  );

  // Open exactly the parent submenu of the active route — nothing else.
  // Whenever the route changes (click, browser back/forward, etc.), this
  // recomputes and any previously open submenu auto-collapses.
  const [openKeys, setOpenKeys] = useState<string[]>(
    activeParentSubmenu ? [activeParentSubmenu] : [],
  );
  useEffect(() => {
    setOpenKeys(activeParentSubmenu ? [activeParentSubmenu] : []);
  }, [activeParentSubmenu]);

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
            // Accordion behaviour: only one submenu open at a time. Antd
            // reports the full set after a toggle — we keep just the latest
            // key (if the user opened something), so any previously expanded
            // submenu collapses on its own.
            onOpenChange={(keys) => {
              const next = (keys as string[]).find((k) => !openKeys.includes(k));
              setOpenKeys(next ? [next] : []);
            }}
            items={menuItems}
            onClick={({ key, keyPath }) => {
              if (!key.startsWith("/")) return;
              // Collapse every submenu except the one containing the clicked
              // leaf. Done here too (not just via the route-sync effect) so
              // clicking the active item still collapses any peeked submenu.
              const parent = (keyPath ?? []).find((k) => !k.startsWith("/"));
              setOpenKeys(parent ? [parent] : []);
              navigate(key);
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
