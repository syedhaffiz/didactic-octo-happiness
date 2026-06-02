// Root component: theme + identity + router.
//
// Used in both run modes:
//   - Federated: imported by the host via Module Federation and rendered under
//     the host's MsalProvider. The host owns auth; AuthProvider just reads the
//     host's account and registers its PCA with the API interceptor. `basename`
//     lets the host mount us under a sub-path (e.g. "/irm").
//   - Standalone (npm run dev): no host, so no token — for UI work on mocks.

import { useMemo } from "react";
import { RouterProvider } from "react-router-dom";
import { ThemeProvider } from "./theme/ThemeProvider";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { AuthProvider } from "./auth/AuthProvider";
import { createAppRouter } from "./routes";

interface AppProps {
  basename?: string;
}

export const App = ({ basename = "/" }: AppProps) => {
  const router = useMemo(() => createAppRouter(basename), [basename]);
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
