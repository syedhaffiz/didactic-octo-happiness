// Root component: theme + auth + router.
//
// Used in both run modes:
//   - Standalone: rendered from main.tsx (basename "/"). AuthProvider either
//     gates behind SSO or passes through with a placeholder identity.
//   - Federated: imported by the host via Module Federation and rendered under
//     the host's MsalProvider. `basename` lets the host mount us under any
//     sub-path (e.g. "/irm").

import { useMemo } from "react";
import { RouterProvider } from "react-router-dom";
import { ThemeProvider } from "./theme/ThemeProvider";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { AuthProvider } from "./auth/AuthProvider";
import { createAppRouter } from "./routes";

interface AppProps {
  basename?: string;
  // Passed by a federation host to indicate whether the host runs SSO.
  ssoEnabled?: boolean;
}

export const App = ({ basename = "/", ssoEnabled }: AppProps) => {
  const router = useMemo(() => createAppRouter(basename), [basename]);
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider ssoEnabled={ssoEnabled}>
          <RouterProvider router={router} />
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
