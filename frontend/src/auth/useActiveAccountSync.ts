// Keeps the MSAL active account in sync with login / token events, and
// registers the current PCA instance as the active one so the axios
// interceptor can acquire tokens without going through React context.
//
// Standalone: re-registers our own instance (harmless — already set at load).
// Federated: registers the host's instance, which the interceptor otherwise
//   has no reference to. Runs only when auth is active (mounted from
//   MsalIdentityProvider).

import { useEffect } from "react";
import { useMsal } from "@azure/msal-react";
import { EventType, type AuthenticationResult } from "@azure/msal-browser";
import { setActivePca } from "./msalConfig";

export const useActiveAccountSync = () => {
  const { instance } = useMsal();

  useEffect(() => {
    setActivePca(instance);

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
};
