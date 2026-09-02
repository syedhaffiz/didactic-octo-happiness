import { type ReactNode } from "react";
import { Popover } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import {
  DollarCircleOutlined,
  InboxOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
  ProfileOutlined,
  DeploymentUnitOutlined,
  SearchOutlined,
  SafetyOutlined,
  BankOutlined,
  SettingOutlined,
} from "@ant-design/icons";

// ---------------------------------------------------------------------------
// Navigation model. The rail shows one entry per top-level section. A section
// with `children` behaves like an antd vertical submenu: hovering its rail
// item pops out a flyout listing the children (and clicking the item jumps to
// the first child). A section with a single `path` is a plain link — clicking
// navigates, and there is no flyout. `muted` dims placeholder-only sections.
// ---------------------------------------------------------------------------
export interface SubNavItem {
  label: string;
  path: string;
}
export interface NavSection {
  key: string;
  icon: ReactNode;
  label: string;
  basePath: string;
  muted?: boolean;
  path?: string;
  children?: SubNavItem[];
}

export const navSections: NavSection[] = [
  {
    key: "finance",
    icon: <DollarCircleOutlined />,
    label: "Finance",
    basePath: "/finance",
    children: [
      { label: "Overview", path: "/finance/overview" },
      { label: "Sales", path: "/finance/sales" },
      { label: "Working Capital", path: "/finance/working-capital" },
      { label: "Revenue", path: "/finance/overview/revenue" },
      { label: "Profitability", path: "/finance/overview/profitability" },
      { label: "Inventory Days", path: "/finance/inventory-days" },
      { label: "Debtors", path: "/finance/debtors" },
      { label: "Insurance Status", path: "/finance/insurance-status" },
      { label: "Aging", path: "/finance/aging" },
    ],
  },
  {
    key: "inventory",
    icon: <InboxOutlined />,
    label: "Inventory",
    basePath: "/inventory",
    children: [
      { label: "Index", path: "/inventory/index" },
      { label: "Overview", path: "/inventory/inventory" },
    ],
  },
  {
    key: "logistics",
    icon: <ShoppingCartOutlined />,
    label: "Logistics",
    basePath: "/logistics",
    path: "/logistics",
  },
  {
    key: "marketing",
    icon: <TeamOutlined />,
    label: "Marketing",
    basePath: "/marketing",
    children: [
      { label: "Index Movement", path: "/marketing/index-movement" },
      { label: "Market Share", path: "/marketing/market-share" },
      { label: "Ocean Freight", path: "/marketing/ocean-freight" },
      { label: "Target above 2%", path: "/marketing/target" },
    ],
  },
  {
    key: "legal",
    icon: <ProfileOutlined />,
    label: "Legal",
    basePath: "/legal",
    path: "/legal",
  },
  {
    key: "planning",
    icon: <DeploymentUnitOutlined />,
    label: "Planning",
    basePath: "/planning",
    path: "/planning",
    muted: true,
  },
  {
    key: "sourcing",
    icon: <SearchOutlined />,
    label: "Sourcing",
    basePath: "/sourcing",
    path: "/sourcing",
    muted: true,
  },
  {
    key: "customs",
    icon: <SafetyOutlined />,
    label: "Customs",
    basePath: "/customs",
    path: "/customs",
    muted: true,
  },
  {
    key: "commercial",
    icon: <BankOutlined />,
    label: "Commercial",
    basePath: "/commercial",
    path: "/commercial",
    muted: true,
  },
];

// Settings sits apart, pinned to the bottom of the rail.
const settingsSection: NavSection = {
  key: "settings",
  icon: <SettingOutlined />,
  label: "Settings",
  basePath: "/settings",
  path: "/settings",
};

// True when `pathname` is `base` or a descendant of it (segment-aware, so
// "/finance" never matches "/financials").
const isUnder = (pathname: string, base: string) =>
  pathname === base || pathname.startsWith(base + "/");

export const SideNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;

  // The active section is the one whose base path contains the current route.
  // Settings is included so its own page highlights too.
  const allSections = [...navSections, settingsSection];
  const activeSection =
    allSections.find((s) => isUnder(pathname, s.basePath)) ?? navSections[0];

  // The active sub-item is the child whose path is the longest prefix of the
  // current route — so /finance/overview/revenue highlights "Revenue", not the
  // shorter "Overview". Only relevant for the active section's flyout.
  const activeChildPath = activeSection.children
    ?.filter((c) => isUnder(pathname, c.path))
    .sort((a, b) => b.path.length - a.path.length)[0]?.path;

  const go = (path: string) => {
    if (path !== pathname) navigate(path);
  };

  const renderRailItem = (section: NavSection) => {
    const active = section.key === activeSection.key;
    // Where a click on the rail item lands: the section's own page, or the
    // first child for a submenu section.
    const target = section.children ? section.children[0].path : section.path!;
    const cls = ["ct-rail-item", active ? "active" : "", section.muted ? "muted" : ""]
      .filter(Boolean)
      .join(" ");

    const item = (
      <div
        key={section.key}
        className={cls}
        role="button"
        tabIndex={0}
        aria-current={active ? "page" : undefined}
        aria-haspopup={section.children ? "menu" : undefined}
        title={section.label}
        onClick={() => go(target)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            go(target);
          }
        }}
      >
        <span className="ct-rail-icon">{section.icon}</span>
        <span className="ct-rail-label">{section.label}</span>
      </div>
    );

    // Leaf section → plain link, no flyout.
    if (!section.children) return item;

    // Submenu section → hover flyout to the right, like an antd vertical
    // submenu. Popover portals to the body (escaping the Sider's clipping) and
    // keeps the panel open while the pointer travels from the rail into it.
    const flyout = (
      <div className="ct-flyout">
        {section.children.map((child) => {
          const childActive = active && child.path === activeChildPath;
          return (
            <div
              key={child.path}
              className={`ct-flyout-item${childActive ? " active" : ""}`}
              role="button"
              tabIndex={0}
              aria-current={childActive ? "page" : undefined}
              onClick={() => go(child.path)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  go(child.path);
                }
              }}
            >
              {child.label}
            </div>
          );
        })}
      </div>
    );
    return (
      <Popover
        key={section.key}
        content={flyout}
        title={section.label}
        placement="rightTop"
        trigger="hover"
        arrow={false}
        overlayClassName="ct-rail-flyout"
      >
        {item}
      </Popover>
    );
  };

  return (
    <nav className="ct-sidenav" aria-label="Primary">
      <div className="ct-rail">
        {navSections.map(renderRailItem)}
        <div className="ct-rail-spacer" />
        {renderRailItem(settingsSection)}
      </div>
    </nav>
  );
};
