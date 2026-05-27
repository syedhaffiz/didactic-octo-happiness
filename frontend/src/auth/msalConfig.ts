// Azure AD / Entra ID configuration via MSAL.
//
// SSO is REQUIRED. The app refuses to start if these env vars aren't set
// (see `main.tsx` for the fallback error screen):
//   VITE_AZURE_CLIENT_ID   — the app registration's client ID
//   VITE_AZURE_TENANT_ID   — tenant ID, or "common" / "organizations"
//   VITE_AZURE_REDIRECT_URI — defaults to window.location.origin

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

// Thrown at module load if SSO env vars are missing. `main.tsx` catches it
// and renders a setup-guidance screen so the dev knows exactly what to fix.
export class MissingAuthConfigError extends Error {
  constructor() {
    super(
      "VITE_AZURE_CLIENT_ID is not set. SSO is required — copy " +
        "`frontend/.env.example` to `frontend/.env.local` and fill in your " +
        "Azure app registration details, then restart the dev server.",
    );
    this.name = "MissingAuthConfigError";
  }
}

if (!clientId) {
  throw new MissingAuthConfigError();
}

// Scopes requested for the bearer token. Microsoft Graph User.Read is the
// safe default — it lets us read the signed-in user's basic profile and
// confirms a working token. When the backend gets its own Azure AD app
// registration, swap this for a custom scope like
// `api://<backend-app-id>/access_as_user` to receive backend-issued tokens.
export const API_SCOPES = ["User.Read"];

const msalConfig: Configuration = {
  auth: {
    clientId,
    authority: `https://login.microsoftonline.com/${tenantId}`,
    redirectUri,
    postLogoutRedirectUri: redirectUri,
  },
  cache: {
    cacheLocation: "sessionStorage",
  },
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

// Module-level singleton — same instance the axios interceptor uses to
// acquire tokens and the React provider uses for sign-in state.
export const pca = new PublicClientApplication(msalConfig);

export const loginRequest = { scopes: API_SCOPES };
