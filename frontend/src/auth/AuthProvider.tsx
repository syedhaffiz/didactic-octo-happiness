// Top-level auth wrapper. SSO is mandatory: every route is gated behind
// a Microsoft sign-in redirect.
//
// MSAL initialisation happens *before* React mounts (see `auth/bootstrap.ts`),
// so by the time this provider renders, `pca.initialize()` and
// `handleRedirectPromise()` have already completed.

import { useEffect, type ReactNode } from "react";
import { MsalProvider, MsalAuthenticationTemplate, useMsal } from "@azure/msal-react";
import {
  EventType,
  InteractionType,
  type AuthenticationResult,
} from "@azure/msal-browser";
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

// Keep MSAL's active account in sync with subsequent login / silent-token
// events. Bootstrap handles the initial pick; this just covers what comes
// after (e.g. user signs in via the login template, switches accounts, etc.).
const ActiveAccountSync = ({ children }: { children: ReactNode }) => {
  const { instance } = useMsal();

  useEffect(() => {
    const callbackId = instance.addEventCallback((event) => {
      if (
        (event.eventType === EventType.LOGIN_SUCCESS ||
          event.eventType === EventType.ACQUIRE_TOKEN_SUCCESS) &&
        event.payload &&
        "account" in event.payload
      ) {
        const payload = event.payload as AuthenticationResult;
        if (payload.account) instance.setActiveAccount(payload.account);
      }
    });
    return () => {
      if (callbackId) instance.removeEventCallback(callbackId);
    };
  }, [instance]);

  return <>{children}</>;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => (
  <MsalProvider instance={pca}>
    <ActiveAccountSync>
      <MsalAuthenticationTemplate
        interactionType={InteractionType.Redirect}
        authenticationRequest={loginRequest}
        loadingComponent={LoadingFallback}
        errorComponent={ErrorFallback}
      >
        {children}
      </MsalAuthenticationTemplate>
    </ActiveAccountSync>
  </MsalProvider>
);
