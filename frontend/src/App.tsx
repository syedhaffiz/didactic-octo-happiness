// Root component: theme + auth + router.
//
// AuthProvider either gates the app behind SSO or, when SSO is disabled,
// passes through with a placeholder identity. Either way the router (and the
// API layer beneath it) renders the same.

import { RouterProvider } from "react-router-dom";
import { ThemeProvider } from "./theme/ThemeProvider";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { AuthProvider } from "./auth/AuthProvider";
import { router } from "./routes";

export const App = () => (
  <ErrorBoundary>
    <ThemeProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ThemeProvider>
  </ErrorBoundary>
);

export default App;
