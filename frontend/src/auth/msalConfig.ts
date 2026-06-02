// Azure AD / Entra ID configuration via MSAL.
//
// Three run modes, resolved at build time:
//
//   Standalone + SSO on  (default): VITE_SSO_ENABLED!=false, VITE_FEDERATED
//     unset. The Azure vars below are required, the `pca` singleton is created
//     at module load, and the app is gated behind a Microsoft sign-in.
//
//   Standalone + SSO off: VITE_SSO_ENABLED=false. No PCA, no Azure config
//     required, no sign-in gate. The axios interceptor sends a dummy bearer
//     token and the header shows a placeholder user.
//
//   Federated: VITE_FEDERATED=true. Mounted inside a Module Federation host.
//     We do NOT create a PCA — the host owns the PublicClientApplication and
//     the sign-in flow. Our AuthProvider reads the host's instance via
//     useMsal() and registers it through setActivePca() so the interceptor can
//     acquire tokens against it. The SSO toggle is ignored in this mode.
//
// Required env vars (standalone + SSO on only):
//   VITE_AZURE_CLIENT_ID    — the app registration's client ID
//   VITE_AZURE_TENANT_ID    — tenant ID, or "common" / "organizations"
//   VITE_AZURE_REDIRECT_URI — defaults to window.location.origin

import {
  PublicClientApplication,
  LogLevel,
  type Configuration,
  type IPublicClientApplication,
} from "@azure/msal-browser";

// Mounted inside a federation host — the host owns auth.
export const IS_FEDERATED = import.meta.env.VITE_FEDERATED === "true";

// SSO is on unless explicitly disabled. Defaulting to ON keeps deployed
// environments secure unless someone deliberately turns it off. Irrelevant in
// federated mode (the host decides).
export const SSO_ENABLED = import.meta.env.VITE_SSO_ENABLED !== "false";

// Used when SSO is OFF (standalone): a placeholder identity for the header and
// a fixed bearer token attached to every API call.
export const DUMMY_USERNAME = "Demo User";
export const DUMMY_TOKEN = "dummy-token";

// Auth is actively enforced when we run our own SSO gate OR a host owns it.
// In federated mode the host can override this at runtime (it may itself be
// running without SSO), so the token helper reads it through isAuthActive().
export const AUTH_ACTIVE = IS_FEDERATED || SSO_ENABLED;

let authActiveOverride: boolean | null = null;
export const setAuthActive = (active: boolean) => {
  authActiveOverride = active;
};
export const isAuthActive = (): boolean => authActiveOverride ?? AUTH_ACTIVE;

const clientId = import.meta.env.VITE_AZURE_CLIENT_ID as string | undefined;
const tenantId = (import.meta.env.VITE_AZURE_TENANT_ID as string | undefined) ?? "common";
const redirectUri =
  (import.meta.env.VITE_AZURE_REDIRECT_URI as string | undefined) ??
  (typeof window !== "undefined" ? window.location.origin : "/");

// Thrown at module load if SSO is on (standalone) but its env vars are missing.
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

// --- PCA singleton (standalone + SSO on only) -----------------------------

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

if (SSO_ENABLED && !IS_FEDERATED) {
  if (!clientId) throw new MissingAuthConfigError();
  standalonePca = new PublicClientApplication(msalConfig);
}

// `pca` is the standalone singleton (null in federated or SSO-off mode).
// Bootstrap and AuthProvider import it directly.
export const pca = standalonePca;

// --- Active PCA (read by the axios interceptor) ---------------------------
//
// Standalone: bootstrap/AuthProvider register our own `pca` early.
// Federated: AuthProvider reads useMsal().instance (the host's PCA) and
//   registers it here so the interceptor uses the host's instance.

let activePca: IPublicClientApplication | null = standalonePca;

export const setActivePca = (instance: IPublicClientApplication) => {
  activePca = instance;
};

export const getActivePca = (): IPublicClientApplication | null => activePca;
