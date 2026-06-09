// MSAL config for the remote's OWN silent SSO.
//
// The remote authenticates itself silently using its own app registration
// (client/tenant id from env), riding the session the host already established
// for the same user/tenant. It never shows a sign-in prompt and has no
// sign-out — interactive login and logout are the host's job.
//
//   VITE_AZURE_CLIENT_ID    — the remote app registration's client ID
//   VITE_AZURE_TENANT_ID    — tenant ID (or "common" / "organizations")
//   VITE_AZURE_REDIRECT_URI — SPA redirect URI for the silent iframe; defaults
//                             to the current origin (the host's origin at
//                             runtime), which must be registered in Azure.
//
// If VITE_AZURE_CLIENT_ID is absent, auth is disabled: no token, placeholder
// identity (fine for standalone UI work on mock data).

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

export const API_SCOPES = ["User.Read"];

// Whether the remote will attempt silent auth (env present).
export const AUTH_ENABLED = Boolean(clientId);

const config: Configuration = {
  auth: {
    clientId: clientId ?? "",
    authority: `https://login.microsoftonline.com/${tenantId}`,
    redirectUri,
  },
  cache: { cacheLocation: "sessionStorage" },
  system: {
    loggerOptions: {
      logLevel: import.meta.env.DEV ? LogLevel.Warning : LogLevel.Error,
      piiLoggingEnabled: false,
      loggerCallback: (level, message) => {
        if (level === LogLevel.Error) console.error("[msal]", message);
        else if (level === LogLevel.Warning) console.warn("[msal]", message);
      },
    },
  },
};

// PCA only when configured; otherwise null (auth disabled).
export const pca = clientId ? new PublicClientApplication(config) : null;
