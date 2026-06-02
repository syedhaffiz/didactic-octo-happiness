// MSAL config for the HOST. The host owns the single PublicClientApplication
// for the whole portal; the remote reuses this instance (shared singleton).
//
// SSO is toggled by VITE_SSO_ENABLED (default on). When off, no PCA is created
// and no Azure config is required — the host runs with a placeholder user and
// tells the remote to do the same. Handy for demoing federation without Azure.

import {
  PublicClientApplication,
  LogLevel,
  type Configuration,
} from "@azure/msal-browser";

export const SSO_ENABLED = import.meta.env.VITE_SSO_ENABLED !== "false";
export const DUMMY_USERNAME = "Demo User";

const clientId = import.meta.env.VITE_AZURE_CLIENT_ID as string | undefined;
const tenantId = (import.meta.env.VITE_AZURE_TENANT_ID as string | undefined) ?? "common";
const redirectUri =
  (import.meta.env.VITE_AZURE_REDIRECT_URI as string | undefined) ??
  (typeof window !== "undefined" ? window.location.origin : "/");

export const API_SCOPES = ["User.Read"];
export const loginRequest = { scopes: API_SCOPES };

const msalConfig: Configuration = {
  auth: {
    clientId: clientId ?? "",
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

let instance: PublicClientApplication | null = null;

if (SSO_ENABLED) {
  if (!clientId) {
    throw new Error(
      "VITE_AZURE_CLIENT_ID is not set while SSO is enabled. Fill in " +
        "host/.env.local, or set VITE_SSO_ENABLED=false to run without SSO.",
    );
  }
  instance = new PublicClientApplication(msalConfig);
}

export const pca = instance;
