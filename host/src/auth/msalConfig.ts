// Host's MSAL setup. The host owns the PublicClientApplication; the remote
// inherits this same instance because @azure/msal-browser is marked
// `singleton: true` in both federation configs.

import { PublicClientApplication, type Configuration } from '@azure/msal-browser'

const clientId = import.meta.env.VITE_AZURE_CLIENT_ID as string | undefined
const tenantId = (import.meta.env.VITE_AZURE_TENANT_ID as string | undefined) ?? 'common'
const redirectUri =
  (import.meta.env.VITE_AZURE_REDIRECT_URI as string | undefined) ??
  window.location.origin

if (!clientId) {
  throw new Error(
    'VITE_AZURE_CLIENT_ID is not set. Copy host/.env.example to host/.env.local ' +
      'and fill in your Azure app registration details, then restart `npm run dev`.',
  )
}

const config: Configuration = {
  auth: {
    clientId,
    authority: `https://login.microsoftonline.com/${tenantId}`,
    redirectUri,
    postLogoutRedirectUri: redirectUri,
  },
  cache: { cacheLocation: 'sessionStorage' },
}

export const pca = new PublicClientApplication(config)

// Same scope the remote expects. If the host has its own API scope add it
// here; MSAL caches tokens per-scope so multiple scopes coexist fine.
export const loginRequest = { scopes: ['User.Read'] }
