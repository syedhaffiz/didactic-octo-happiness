// MSAL token wiring for the remote.
//
// The remote does NOT authenticate. The HOST owns the single
// PublicClientApplication and the sign-in flow. Once the remote is mounted
// under the host's MsalProvider, `useActiveAccountSync` registers that instance
// here via `setActivePca`, and the axios interceptor acquires tokens against it.
//
// Run on its own (npm run dev, no host) there is no MSAL instance, so no token
// is attached — fine for UI work against mock data.

import type { IPublicClientApplication } from "@azure/msal-browser";

// Scopes requested for the bearer token (must match what the host consents to).
export const API_SCOPES = ["User.Read"];

// The host's MSAL instance, registered by useActiveAccountSync after mount.
// Null until then (and always null when the remote runs standalone).
let activePca: IPublicClientApplication | null = null;

export const setActivePca = (instance: IPublicClientApplication) => {
  activePca = instance;
};

export const getActivePca = (): IPublicClientApplication | null => activePca;
