// Pre-React bootstrap for MSAL.
//
// When SSO is disabled there is no PCA, so this is a no-op.

import { pca } from "./msalConfig";

export const bootstrapAuth = async (): Promise<void> => {
  if (!pca) return; // SSO disabled

  await pca.initialize();
  await pca.handleRedirectPromise();

  if (!pca.getActiveAccount()) {
    const first = pca.getAllAccounts()[0];
    if (first) pca.setActiveAccount(first);
  }
};
