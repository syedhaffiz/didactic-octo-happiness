// Registry for the host's MSAL instance, passed into the remote as the
// `msalInstance` prop on the exposed App. Stored module-side so the non-React
// axios interceptor can acquire tokens without going through React context.
//
// The remote never creates a PublicClientApplication and has no app
// registration of its own — it uses the host's instance (host's app
// registration). `@azure/msal-browser` is imported type-only here, so the
// remote bundles no MSAL runtime; it just calls methods on the live instance
// the host provides (duck-typed), which also means host/remote msal-browser
// versions don't need to match.

import type { IPublicClientApplication } from "@azure/msal-browser";

// Scopes the remote's API token needs. Adjust to your backend's scope.
export const API_SCOPES = ["User.Read"];

let instance: IPublicClientApplication | null = null;

export const setMsalInstance = (next: IPublicClientApplication | null) => {
  instance = next;
};

export const getMsalInstance = (): IPublicClientApplication | null => instance;
