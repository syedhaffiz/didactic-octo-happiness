import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { FinanceOverview } from "./pages/finance/Overview";
import { Placeholder } from "./pages/Placeholder";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/finance/overview" replace /> },
      { path: "finance/overview", element: <FinanceOverview /> },
      { path: "finance/sales", element: <Placeholder title="Sales Overview" /> },
      { path: "finance/revenue", element: <Placeholder title="Revenue" /> },
      { path: "finance/working-capital", element: <Placeholder title="Working Capital" /> },
      { path: "finance/profitability", element: <Placeholder title="Gross Margin Profitability" /> },
      { path: "finance/approved-budget", element: <Placeholder title="Approved Budget" /> },
      { path: "finance/dispatch", element: <Placeholder title="Dispatch" /> },
      { path: "finance/inventory-days", element: <Placeholder title="Inventory Days" /> },
      { path: "logistics", element: <Placeholder title="Logistics" /> },
      { path: "marketing", element: <Placeholder title="Marketing" /> },
      { path: "legal", element: <Placeholder title="Legal" /> },
      { path: "planning", element: <Placeholder title="Planning" /> },
      { path: "sourcing", element: <Placeholder title="Sourcing" /> },
      { path: "customs", element: <Placeholder title="Customs" /> },
      { path: "commercial", element: <Placeholder title="Commercial" /> },
      { path: "*", element: <Placeholder title="Not found" /> },
    ],
  },
]);
