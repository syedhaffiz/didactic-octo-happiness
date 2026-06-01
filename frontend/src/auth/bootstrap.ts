// Pre-React bootstrap for MSAL (standalone mode only).
//
// In federated mode the host has already initialised its own PCA before
// mounting us, so this is a no-op.

import { pca } from "./msalConfig";

export const bootstrapAuth = async (): Promise<void> => {
  if (!pca) return; // federated mode

  await pca.initialize();
  await pca.handleRedirectPromise();

  if (!pca.getActiveAccount()) {
    const first = pca.getAllAccounts()[0];
    if (first) pca.setActiveAccount(first);
  }
};
