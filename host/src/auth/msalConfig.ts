// MSAL config for the HOST — the single auth authority for the whole portal.
// The host signs the user in; the remote reuses this instance (shared
// singleton) to acquire tokens. SSO is always on.
//
// Required env vars (host/.env.local):
//   VITE_AZURE_CLIENT_ID    — the app registration's client ID
//   VITE_AZURE_TENANT_ID    — tenant ID, or "common" / "organizations"
//   VITE_AZURE_REDIRECT_URI — defaults to window.location.origin (use :3000)

import {
  PublicClientApplication,
  LogLevel,
  type Configuration,
} from "@azure/msal-browser";

const clientId = import.meta.env.VITE_AZURE_CLIENT_ID as string | undefined;
const tenantId = (import.meta.env.VITE_AZURE_TENANT_ID as string | undefined) ?? "common";
const redirectUri =
  (import.meta.env.VITE_AZURE_REDIRECT_URI as string | undefined) ??
  (typeof window !== "undefined" ? window.location.origin : "/");

if (!clientId) {
  throw new Error(
    "VITE_AZURE_CLIENT_ID is not set. Copy host/.env.example to " +
      "host/.env.local and fill in your Azure app registration details.",
  );
}

export const API_SCOPES = ["User.Read"];
export const loginRequest = { scopes: API_SCOPES };

const msalConfig: Configuration = {
  auth: {
    clientId,
    authority: `https://login.microsoftonline.com/${tenantId}`,
    redirectUri,
    postLogoutRedirectUri: redirectUri,
  },
  cache: { cacheLocation: "sessionStorage" },
  system: {
    loggerOptions: {
      logLevel: import.meta.env.DEV ? LogLevel.Warning : LogLevel.Error,
      piiLoggingEnabled: false,
      loggerCallback: (level, message) => {
        if (level === LogLevel.Error) console.error("[host msal]", message);
        else if (level === LogLevel.Warning) console.warn("[host msal]", message);
      },
    },
  },
};

export const pca = new PublicClientApplication(msalConfig);
