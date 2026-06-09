// Root component: theme + identity + router.
//
// The remote authenticates itself silently (ssoSilent) using its own app
// registration from env (see auth/msalConfig.ts), riding the session the host
// established. It needs no auth props from the host — only `basename`, which
// lets the host mount it under a sub-path (e.g. "/irm"). Standalone (npm run
// dev) with no auth env runs token-less for UI work on mock data.

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
