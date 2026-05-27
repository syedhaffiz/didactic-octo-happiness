// Pre-React bootstrap for MSAL.
//
// MSAL v5 mandates `initialize()` is awaited before any other call. We do that
// here (before React mounts) and also run `handleRedirectPromise()` once so
// the post-login redirect response is consumed before any component tries to
// read accounts or acquire tokens.

import { pca } from "./msalConfig";

export const bootstrapAuth = async (): Promise<void> => {
  await pca.initialize();
  // Returns null on first load (no redirect in flight), or the
  // AuthenticationResult if we just landed back from Microsoft sign-in.
  await pca.handleRedirectPromise();

  // After a successful login MSAL has the account cached but the *active*
  // account is unset on a hard reload. Pick the first one so token
  // acquisition has someone to ask.
  if (!pca.getActiveAccount()) {
    const first = pca.getAllAccounts()[0];
    if (first) pca.setActiveAccount(first);
  }
};
