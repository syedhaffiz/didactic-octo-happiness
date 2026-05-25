import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { FinanceOverview } from "./pages/finance/Overview";
import { Sales } from "./pages/finance/Sales";
import { Revenue } from "./pages/finance/Revenue";
import { WorkingCapital } from "./pages/finance/WorkingCapital";
import { Profitability } from "./pages/finance/Profitability";
import { ApprovedBudget } from "./pages/finance/ApprovedBudget";
import { InventoryShell } from "./pages/inventory/InventoryShell";
import { IndexPage } from "./pages/inventory/IndexPage";
import { OverviewPage as InventoryOverviewPage } from "./pages/inventory/OverviewPage";
import { Placeholder } from "./pages/Placeholder";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/finance/overview" replace /> },
      { path: "finance/overview", element: <FinanceOverview /> },
      { path: "finance/sales", element: <Sales /> },
      { path: "finance/revenue", element: <Revenue /> },
      { path: "finance/working-capital", element: <WorkingCapital /> },
      { path: "finance/profitability", element: <Profitability /> },
      { path: "finance/approved-budget", element: <ApprovedBudget /> },
      { path: "finance/dispatch", element: <Placeholder title="Dispatch" /> },
      { path: "finance/inventory-days", element: <Placeholder title="Inventory Days" /> },
      {
        path: "inventory",
        element: <InventoryShell />,
        children: [
          { index: true, element: <Navigate to="/inventory/index" replace /> },
          { path: "index", element: <IndexPage /> },
          { path: "inventory", element: <InventoryOverviewPage /> },
        ],
      },
      { path: "logistics", element: <Placeholder title="Logistics" /> },
      { path: "marketing", element: <Placeholder title="Marketing" /> },
      { path: "legal", element: <Placeholder title="Legal" /> },
      { path: "planning", element: <Placeholder title="Planning" /> },
      { path: "sourcing", element: <Placeholder title="Sourcing" /> },
      { path: "customs", element: <Placeholder title="Customs" /> },
      { path: "commercial", element: <Placeholder title="Commercial" /> },
      { path: "settings", element: <Placeholder title="Settings" /> },
      { path: "*", element: <Placeholder title="Not found" /> },
    ],
  },
]);
