// Root component: theme + identity + router.
//
// The host passes its MSAL instance via `msalInstance`; the remote uses it to
// acquire bearer tokens for API calls (it has no app registration / MSAL config
// of its own). `basename` lets the host mount the remote under a sub-path.
// Standalone (npm run dev) gets no instance → token-less, for UI work on mocks.

import { useMemo } from "react";
import { RouterProvider } from "react-router-dom";
import type { IPublicClientApplication } from "@azure/msal-browser";
import { ThemeProvider } from "./theme/ThemeProvider";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { AuthProvider } from "./auth/AuthProvider";
import { createAppRouter } from "./routes";

interface AppProps {
  basename?: string;
  msalInstance?: IPublicClientApplication;
}

export const App = ({ basename = "/", msalInstance }: AppProps) => {
  const router = useMemo(() => createAppRouter(basename), [basename]);
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider msalInstance={msalInstance}>
          <RouterProvider router={router} />
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
