import { lazy } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppShell } from "./components/AppShell";

// Route-level code splitting: each page becomes its own chunk and is fetched
// on demand. The Suspense boundary lives in AppShell so the chrome (header,
// sidebar) renders immediately while the page chunk loads.
const FinanceOverview = lazy(() =>
  import("./pages/finance/Overview").then((m) => ({ default: m.FinanceOverview })),
);
const Sales = lazy(() =>
  import("./pages/finance/Sales").then((m) => ({ default: m.Sales })),
);
const Revenue = lazy(() =>
  import("./pages/finance/Revenue").then((m) => ({ default: m.Revenue })),
);
const WorkingCapital = lazy(() =>
  import("./pages/finance/WorkingCapital").then((m) => ({ default: m.WorkingCapital })),
);
const Profitability = lazy(() =>
  import("./pages/finance/Profitability").then((m) => ({ default: m.Profitability })),
);
const ApprovedBudget = lazy(() =>
  import("./pages/finance/ApprovedBudget").then((m) => ({ default: m.ApprovedBudget })),
);
const InventoryShell = lazy(() =>
  import("./pages/inventory/InventoryShell").then((m) => ({ default: m.InventoryShell })),
);
const IndexPage = lazy(() =>
  import("./pages/inventory/IndexPage").then((m) => ({ default: m.IndexPage })),
);
const InventoryOverviewPage = lazy(() =>
  import("./pages/inventory/OverviewPage").then((m) => ({ default: m.OverviewPage })),
);
const MarketingIndexMovement = lazy(() =>
  import("./pages/marketing/IndexMovementPage").then((m) => ({ default: m.IndexMovementPage })),
);
const MarketingMarketShare = lazy(() =>
  import("./pages/marketing/MarketSharePage").then((m) => ({ default: m.MarketSharePage })),
);
const MarketingOceanFreight = lazy(() =>
  import("./pages/marketing/OceanFreightPage").then((m) => ({ default: m.OceanFreightPage })),
);
const MarketingTarget = lazy(() =>
  import("./pages/marketing/TargetAbove2Page").then((m) => ({ default: m.TargetAbove2Page })),
);
const Placeholder = lazy(() =>
  import("./pages/Placeholder").then((m) => ({ default: m.Placeholder })),
);

// Factory so the same routes work standalone (basename "/") and federated
// (basename "/irm" or whatever the host mounts us under).
export const createAppRouter = (basename: string = "/") =>
  createBrowserRouter(
    [
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
          { path: "marketing", element: <Navigate to="/marketing/index-movement" replace /> },
          { path: "marketing/index-movement", element: <MarketingIndexMovement /> },
          { path: "marketing/market-share", element: <MarketingMarketShare /> },
          { path: "marketing/ocean-freight", element: <MarketingOceanFreight /> },
          { path: "marketing/target", element: <MarketingTarget /> },
          { path: "legal", element: <Placeholder title="Legal" /> },
          { path: "planning", element: <Placeholder title="Planning" /> },
          { path: "sourcing", element: <Placeholder title="Sourcing" /> },
          { path: "customs", element: <Placeholder title="Customs" /> },
          { path: "commercial", element: <Placeholder title="Commercial" /> },
          { path: "settings", element: <Placeholder title="Settings" /> },
          { path: "*", element: <Placeholder title="Not found" /> },
        ],
      },
    ],
    { basename },
  );

// Standalone default (basename "/"). Federated mounts call createAppRouter
// with the host-allocated basename instead.
export const router = createAppRouter("/");
