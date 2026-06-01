// The mount component. Used in both:
//   - Standalone: rendered from main.tsx under our own MsalProvider + sign-in template.
//   - Federated: imported by the host (via Module Federation `exposes`) and
//     rendered under the host's MsalProvider. The host owns SSO; we just
//     register their PCA with our axios interceptor via useActiveAccountSync.
//
// `basename` lets the host mount us under any sub-path (e.g. "/control-tower").

import { useMemo } from "react";
import { RouterProvider } from "react-router-dom";
import { ThemeProvider } from "./theme/ThemeProvider";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { createAppRouter } from "./routes";
import { useActiveAccountSync } from "./auth/useActiveAccountSync";

interface AppProps {
  basename?: string;
}

export const App = ({ basename = "/" }: AppProps) => {
  const router = useMemo(() => createAppRouter(basename), [basename]);
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <SyncAuth />
        <RouterProvider router={router} />
      </ThemeProvider>
    </ErrorBoundary>
  );
};

// Hook-runner wrapper — `useActiveAccountSync` needs to be inside MsalProvider.
// In both run modes there's an MsalProvider above App.
const SyncAuth = () => {
  useActiveAccountSync();
  return null;
};

export default App;
