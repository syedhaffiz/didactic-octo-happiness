// Auth wrapper + identity context.
//
// Exposes a single `useIdentity()` hook that the rest of the app reads for the
// current user's display name and a sign-out action — without any component
// having to know which auth mode is active.
//
//   FEDERATED: the host already rendered MsalProvider + the sign-in gate. We
//              render neither; we just read the host's account via useMsal and
//              register its PCA with the interceptor.
//   SSO ON:    render MsalProvider + MsalAuthenticationTemplate (sign-in gate),
//              keep the active account in sync, surface the real account name.
//   SSO OFF:   render no MSAL at all and surface a placeholder user.
//
// AuthProvider itself calls no hooks before branching, so switching modes on a
// constant does not violate the rules of hooks.

import { createContext, useContext, type ReactNode } from "react";
import { MsalProvider, MsalAuthenticationTemplate, useMsal } from "@azure/msal-react";
import { InteractionType } from "@azure/msal-browser";
import { Alert, Skeleton } from "antd";
import {
  DUMMY_USERNAME,
  IS_FEDERATED,
  SSO_ENABLED,
  loginRequest,
  pca,
  setAuthActive,
} from "./msalConfig";
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
      title="Sign-in failed"
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

const DummyIdentity = ({ children }: { children: ReactNode }) => (
  <IdentityContext.Provider value={{ name: DUMMY_USERNAME, signOut: () => {} }}>
    {children}
  </IdentityContext.Provider>
);

interface AuthProviderProps {
  children: ReactNode;
  // Set by a federation host to communicate whether IT runs SSO. Ignored in
  // standalone mode (we use our own VITE_SSO_ENABLED there).
  ssoEnabled?: boolean;
}

export const AuthProvider = ({ children, ssoEnabled }: AuthProviderProps) => {
  // Federated — the host owns auth. If the host runs SSO we read its account
  // via useMsal; if it doesn't, fall back to the placeholder identity.
  if (IS_FEDERATED) {
    const hostSso = ssoEnabled ?? true;
    setAuthActive(hostSso);
    return hostSso ? (
      <MsalIdentityProvider>{children}</MsalIdentityProvider>
    ) : (
      <DummyIdentity>{children}</DummyIdentity>
    );
  }

  // SSO off — no MSAL, placeholder identity, no sign-in gate.
  if (!SSO_ENABLED) {
    setAuthActive(false);
    return <DummyIdentity>{children}</DummyIdentity>;
  }
  setAuthActive(true);

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
