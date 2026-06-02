// Initialise MSAL before React mounts: handleRedirectPromise must run after
// initialize() to complete a redirect sign-in.

import { pca } from "./msalConfig";

export const bootstrapAuth = async (): Promise<void> => {
  await pca.initialize();
  await pca.handleRedirectPromise();

  if (!pca.getActiveAccount()) {
    const first = pca.getAllAccounts()[0];
    if (first) pca.setActiveAccount(first);
  }
};
