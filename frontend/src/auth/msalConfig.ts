// Azure AD / Entra ID configuration via MSAL.
//
// Two run modes:
//
//   Standalone (npm run dev / build): the env vars below are required, the
//   internal `pca` singleton is created at module load, and `getActivePca`
//   returns it. Throws `MissingAuthConfigError` if the vars are missing so
//   a misconfigured dev gets a clear error.
//
//   Federated (npm run build:remote, mounted in a host): set
//   VITE_FEDERATED=true. The internal singleton is NOT created. The host
//   owns the `PublicClientApplication`; our App component calls
//   `setActivePca` with the host's instance (read via `useMsal()`) so the
//   axios interceptor can acquire tokens against it.
//
// Required env vars (standalone only):
//   VITE_AZURE_CLIENT_ID   — the app registration's client ID
//   VITE_AZURE_TENANT_ID   — tenant ID, or "common" / "organizations"
//   VITE_AZURE_REDIRECT_URI — defaults to window.location.origin

import {
  PublicClientApplication,
  LogLevel,
  type Configuration,
  type IPublicClientApplication,
} from "@azure/msal-browser";

const clientId = import.meta.env.VITE_AZURE_CLIENT_ID as string | undefined;
const tenantId = (import.meta.env.VITE_AZURE_TENANT_ID as string | undefined) ?? "common";
const redirectUri =
  (import.meta.env.VITE_AZURE_REDIRECT_URI as string | undefined) ??
  (typeof window !== "undefined" ? window.location.origin : "/");

export const IS_FEDERATED = import.meta.env.VITE_FEDERATED === "true";

// Thrown at module load if SSO env vars are missing in standalone mode.
// `main.tsx` catches it and renders a setup-guidance screen.
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

// Scopes requested for the bearer token.
export const API_SCOPES = ["User.Read"];
export const loginRequest = { scopes: API_SCOPES };

// --- PCA singleton (standalone only) --------------------------------------

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

if (!IS_FEDERATED) {
  if (!clientId) throw new MissingAuthConfigError();
  standalonePca = new PublicClientApplication(msalConfig);
}

// `pca` is the standalone singleton (or null in federated mode). Standalone
// bootstrap, AuthProvider, and standalone main.tsx all import this directly.
export const pca = standalonePca;

// --- Active PCA (read by the axios interceptor) ---------------------------
//
// In standalone mode the bootstrap sets this to our own `pca` early. In
// federated mode App.tsx reads `useMsal().instance` and registers it here
// so the interceptor uses the host's PCA.
let activePca: IPublicClientApplication | null = standalonePca;

export const setActivePca = (instance: IPublicClientApplication) => {
  activePca = instance;
};

export const getActivePca = (): IPublicClientApplication | null => activePca;
