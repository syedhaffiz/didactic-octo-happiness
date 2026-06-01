// Standalone-mode auth wrapper. Provides MsalProvider + MsalAuthenticationTemplate
// using our own PCA singleton.
//
// In federated mode this component is NOT used — the host owns the MsalProvider
// and the sign-in flow. The exposed App component (src/App.tsx) only relies on
// `useActiveAccountSync` to register the host's PCA with the axios interceptor.

import type { ReactNode } from "react";
import { MsalProvider, MsalAuthenticationTemplate } from "@azure/msal-react";
import { InteractionType } from "@azure/msal-browser";
import { Alert, Skeleton } from "antd";
import { loginRequest, pca } from "./msalConfig";

const LoadingFallback = () => (
  <div style={{ padding: 24, maxWidth: 480 }}>
    <Skeleton active paragraph={{ rows: 4 }} />
  </div>
);

const ErrorFallback = ({ error }: { error: unknown }) => (
  <div style={{ padding: 24, maxWidth: 600 }}>
    <Alert
      type="error"
      showIcon
      message="Sign-in failed"
      description={error instanceof Error ? error.message : String(error)}
    />
  </div>
);

export const StandaloneAuthProvider = ({ children }: { children: ReactNode }) => {
  if (!pca) {
    throw new Error(
      "StandaloneAuthProvider used in federated mode — host must provide MsalProvider",
    );
  }
  return (
    <MsalProvider instance={pca}>
      <MsalAuthenticationTemplate
        interactionType={InteractionType.Redirect}
        authenticationRequest={loginRequest}
        loadingComponent={LoadingFallback}
        errorComponent={ErrorFallback}
      >
        {children}
      </MsalAuthenticationTemplate>
    </MsalProvider>
  );
};
