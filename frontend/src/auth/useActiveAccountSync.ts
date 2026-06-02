// Registers the host's MSAL instance with the token helper and keeps the active
// account in sync with login / token events.
//
// When the remote runs without a host (standalone dev), useMsal yields a
// stubbed instance whose methods throw. The try/catch swallows that so the app
// still renders — it just stays token-less (we never register the stub).

import { useEffect } from "react";
import { useMsal } from "@azure/msal-react";
import { EventType, type AuthenticationResult } from "@azure/msal-browser";
import { setActivePca } from "./msalConfig";

export const useActiveAccountSync = () => {
  const { instance } = useMsal();

  useEffect(() => {
    let callbackId: string | null = null;
    try {
      callbackId = instance.addEventCallback((event) => {
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
      // Reached only for a real instance — addEventCallback above throws on the
      // stubbed no-provider instance, so the stub is never registered.
      setActivePca(instance);
    } catch {
      // No host MSAL (standalone) — leave the interceptor token-less.
    }
    return () => {
      if (callbackId) {
        try {
          instance.removeEventCallback(callbackId);
        } catch {
          /* stubbed instance */
        }
      }
    };
  }, [instance]);
};
