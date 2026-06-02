// Azure AD / Entra ID configuration via MSAL.
//
// SSO is toggled by the VITE_SSO_ENABLED env var (build-time, so it also
// applies to deployed builds — set it in the pipeline/host env):
//
//   VITE_SSO_ENABLED=true  (or unset) — SSO ON. The Azure env vars below are
//     required; the `pca` singleton is created at module load and the app is
//     gated behind a Microsoft sign-in. Throws MissingAuthConfigError if the
//     client id is missing so a misconfigured environment fails loudly.
//
//   VITE_SSO_ENABLED=false — SSO OFF. No PCA is created, no Azure config is
//     required, and the sign-in gate is skipped. The axios interceptor sends
//     a dummy bearer token and the UI shows a hardcoded placeholder user.
//     Intended for local dev and non-secured demo deployments.
//
// Required env vars (SSO ON only):
//   VITE_AZURE_CLIENT_ID    — the app registration's client ID
//   VITE_AZURE_TENANT_ID    — tenant ID, or "common" / "organizations"
//   VITE_AZURE_REDIRECT_URI — defaults to window.location.origin

import {
  PublicClientApplication,
  LogLevel,
  type Configuration,
} from "@azure/msal-browser";

// SSO is on unless explicitly disabled. Defaulting to ON keeps deployed
// environments secure unless someone deliberately turns it off.
export const SSO_ENABLED = import.meta.env.VITE_SSO_ENABLED !== "false";

// Used when SSO is OFF: a placeholder identity for the header and a fixed
// bearer token attached to every API call.
export const DUMMY_USERNAME = "Demo User";
export const DUMMY_TOKEN = "dummy-token";

const clientId = import.meta.env.VITE_AZURE_CLIENT_ID as string | undefined;
const tenantId = (import.meta.env.VITE_AZURE_TENANT_ID as string | undefined) ?? "common";
const redirectUri =
  (import.meta.env.VITE_AZURE_REDIRECT_URI as string | undefined) ??
  (typeof window !== "undefined" ? window.location.origin : "/");

// Thrown at module load if SSO is on but its env vars are missing.
// `main.tsx` catches it and renders a setup-guidance screen.
export class MissingAuthConfigError extends Error {
  constructor() {
    super(
      "VITE_AZURE_CLIENT_ID is not set while SSO is enabled. Either fill in " +
        "your Azure app registration details in `frontend/.env.local`, or set " +
        "VITE_SSO_ENABLED=false to run without SSO. Restart the dev server " +
        "after changing env vars.",
    );
    this.name = "MissingAuthConfigError";
  }
}

// Scopes requested for the bearer token.
export const API_SCOPES = ["User.Read"];
export const loginRequest = { scopes: API_SCOPES };

// --- PCA singleton (SSO ON only) ------------------------------------------

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
        if (level === LogLevel.Error) console.error("[msal]", message);
        else if (level === LogLevel.Warning) console.warn("[msal]", message);
      },
    },
  },
};

let standalonePca: PublicClientApplication | null = null;

if (SSO_ENABLED) {
  if (!clientId) throw new MissingAuthConfigError();
  standalonePca = new PublicClientApplication(msalConfig);
}

// `pca` is the MSAL singleton when SSO is on, otherwise null. Bootstrap,
// AuthProvider, and the token helper all import it directly.
export const pca = standalonePca;
