// Initialise MSAL before React mounts so providers/effects don't race
// against an uninitialised instance.

import { pca } from './msalConfig'

export const bootstrapAuth = async () => {
  await pca.initialize()
  await pca.handleRedirectPromise()
  if (!pca.getActiveAccount()) {
    const first = pca.getAllAccounts()[0]
    if (first) pca.setActiveAccount(first)
  }
}
