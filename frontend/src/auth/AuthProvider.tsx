// Auth wrapper + identity context.
//
// Exposes a single `useIdentity()` hook that the rest of the app reads for the
// current user's display name and a sign-out action — without any component
// having to know whether SSO is on or off.
//
//   SSO ON:  renders MsalProvider + MsalAuthenticationTemplate (the sign-in
//            gate), keeps the active account in sync, and surfaces the real
//            account name through the context.
//   SSO OFF: renders no MSAL at all and surfaces a hardcoded placeholder user.
//
// AuthProvider itself calls no hooks before branching, so switching modes on a
// constant does not violate the rules of hooks.

import { createContext, useContext, type ReactNode } from "react";
import { MsalProvider, MsalAuthenticationTemplate, useMsal } from "@azure/msal-react";
import { InteractionType } from "@azure/msal-browser";
import { Alert, Skeleton } from "antd";
import { DUMMY_USERNAME, SSO_ENABLED, loginRequest, pca } from "./msalConfig";
import { signOut } from "./token";
import { useActiveAccountSync } from "./useActiveAccountSync";

interface Identity {
  name: string;
  signOut: () => void;
}

const IdentityContext = createContext<Identity>({
  name: DUMMY_USERNAME,
  signOut: () => {},
});

export const useIdentity = (): Identity => useContext(IdentityContext);

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

// Inner provider used only when SSO is on. Lives under MsalProvider so it can
// read the signed-in account and keep the active account in sync.
const MsalIdentityProvider = ({ children }: { children: ReactNode }) => {
  useActiveAccountSync();
  const { accounts } = useMsal();
  const name = accounts[0]?.name ?? accounts[0]?.username ?? "Account";

  return (
    <IdentityContext.Provider value={{ name, signOut: () => void signOut() }}>
      {children}
    </IdentityContext.Provider>
  );
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // SSO off — no MSAL, placeholder identity, no sign-in gate.
  if (!SSO_ENABLED) {
    return (
      <IdentityContext.Provider value={{ name: DUMMY_USERNAME, signOut: () => {} }}>
        {children}
      </IdentityContext.Provider>
    );
  }

  // SSO on — pca is guaranteed by msalConfig (it throws otherwise).
  if (!pca) {
    throw new Error("SSO is enabled but the MSAL instance was not created.");
  }

  return (
    <MsalProvider instance={pca}>
      <MsalAuthenticationTemplate
        interactionType={InteractionType.Redirect}
        authenticationRequest={loginRequest}
        loadingComponent={LoadingFallback}
        errorComponent={ErrorFallback}
      >
        <MsalIdentityProvider>{children}</MsalIdentityProvider>
      </MsalAuthenticationTemplate>
    </MsalProvider>
  );
};
