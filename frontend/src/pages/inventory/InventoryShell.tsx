import { Outlet, useLocation, useNavigate, Link } from "react-router-dom";
import { Breadcrumb, Tabs } from "antd";
import { HomeOutlined } from "@ant-design/icons";

const TAB_ITEMS = [
  { key: "index", label: "Index" },
  { key: "inventory", label: "Inventory" },
];

export const InventoryShell = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const activeKey = location.pathname.endsWith("/inventory") ? "inventory" : "index";

  return (
    <>
      <Breadcrumb
        items={[
          {
            title: (
              <Link to="/finance/overview">
                <HomeOutlined />
              </Link>
            ),
          },
          { title: <Link to="/inventory/index">Inventory</Link> },
        ]}
        style={{ marginBottom: 8, fontSize: 13 }}
      />
      <Tabs
        activeKey={activeKey}
        onChange={(key) => navigate(`/inventory/${key}`)}
        items={TAB_ITEMS}
        size="large"
        style={{ marginBottom: 12 }}
      />
      <Outlet />
    </>
  );
};
