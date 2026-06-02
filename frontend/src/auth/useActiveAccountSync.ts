// Keeps the MSAL active account in sync with login / token events.
//
// Bootstrap picks the initial account; this hook handles everything after —
// silent token refreshes landing a new account, the user switching accounts,
// etc. Runs only when SSO is on (mounted from MsalIdentityProvider).

import { useEffect } from "react";
import { useMsal } from "@azure/msal-react";
import { EventType, type AuthenticationResult } from "@azure/msal-browser";

export const useActiveAccountSync = () => {
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
};
