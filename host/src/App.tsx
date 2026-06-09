// Host root: owns SSO for the whole portal and a trivial top-level switch
// between Home and the mounted IRM remote.
//
// Intentionally NO react-router here. The remote is a self-contained app with
// its own <RouterProvider> (basename "/irm"); it must be the only router in the
// tree, otherwise React Router throws "Router inside Router" and sharing it as
// a singleton breaks. So the host does its own minimal pathname-based switching
// with the History API.

import { lazy, Suspense, useEffect, useState } from "react";
import { MsalProvider, MsalAuthenticationTemplate, useMsal } from "@azure/msal-react";
import { InteractionType, type IPublicClientApplication } from "@azure/msal-browser";
import { ConfigProvider, Skeleton, Alert } from "antd";
import { loginRequest, pca } from "./auth/msalConfig";
import { HostShell } from "./components/HostShell";
import { Home } from "./pages/Home";

const RemoteApp = lazy(() => import("nr_irm_fe/App"));

export const IRM_BASE = "/irm";

const Loading = () => (
  <div style={{ padding: 32, maxWidth: 480 }}>
    <Skeleton active paragraph={{ rows: 4 }} />
  </div>
);

const SignInError = ({ error }: { error: unknown }) => (
  <div style={{ padding: 32, maxWidth: 600 }}>
    <Alert
      type="error"
      showIcon
      title="Sign-in failed"
      description={error instanceof Error ? error.message : String(error)}
    />
  </div>
);

const Shell = ({
  userName,
  msalInstance,
}: {
  userName: string;
  msalInstance: IPublicClientApplication;
}) => {
  // Top-level navigation without react-router. We only track whether we're on
  // Home or inside IRM; the remote's own router handles everything below /irm
  // (its pushState calls don't fire popstate, so they don't disturb this
  // state — which is what we want).
  const [path, setPath] = useState(() => window.location.pathname);

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const navigate = (to: string) => {
    if (to !== window.location.pathname) {
      window.history.pushState({}, "", to);
      setPath(to);
    }
  };

  const inIrm = path === IRM_BASE || path.startsWith(`${IRM_BASE}/`);

  return (
    <HostShell
      userName={userName}
      active={inIrm ? "irm" : "home"}
      onNavigate={navigate}
    >
      {inIrm ? (
        <Suspense
          fallback={
            <div style={{ padding: 32 }}>
              <Skeleton active paragraph={{ rows: 8 }} />
            </div>
          }
        >
          {/* Hand the remote the host's MSAL instance; it acquires tokens
              silently on it (host's app registration) — no props beyond this. */}
          <RemoteApp basename={IRM_BASE} msalInstance={msalInstance} />
        </Suspense>
      ) : (
        <Home onOpenIrm={() => navigate(IRM_BASE)} />
      )}
    </HostShell>
  );
};

// Lives under MsalProvider: reads the account name for the host header and
// hands the host's MSAL instance to the remote (the remote's only prop besides
// basename).
const AuthedShell = () => {
  const { instance, accounts } = useMsal();
  const name = accounts[0]?.name ?? accounts[0]?.username ?? "Account";
  return <Shell userName={name} msalInstance={instance} />;
};

export const App = () => (
  <ConfigProvider>
    <MsalProvider instance={pca}>
      <MsalAuthenticationTemplate
        interactionType={InteractionType.Redirect}
        authenticationRequest={loginRequest}
        loadingComponent={Loading}
        errorComponent={SignInError}
      >
        <AuthedShell />
      </MsalAuthenticationTemplate>
    </MsalProvider>
  </ConfigProvider>
);

export default App;
