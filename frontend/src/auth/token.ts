// Silent token acquisition for the remote.
//
// First call establishes an account silently via ssoSilent (prompt=none),
// using the existing AAD session the host signed the user into. Subsequent
// calls use acquireTokenSilent. The remote never falls back to an interactive
// prompt — if a token can't be obtained silently it returns null (the host is
// responsible for getting the user signed in).

import {
  InteractionRequiredAuthError,
  type AccountInfo,
} from "@azure/msal-browser";
import { API_SCOPES, pca } from "./msalConfig";

let initPromise: Promise<void> | null = null;

const ensureInit = (): Promise<void> => {
  if (!pca) return Promise.resolve();
  if (!initPromise) {
    initPromise = (async () => {
      await pca.initialize();
      await pca.handleRedirectPromise();
      const existing = pca.getActiveAccount() ?? pca.getAllAccounts()[0];
      if (existing) pca.setActiveAccount(existing);
    })();
  }
  return initPromise;
};

// Returns an account, establishing one silently against the existing session if
// the cache is empty. Null when auth is disabled or no silent session exists.
export const ensureAccount = async (): Promise<AccountInfo | null> => {
  if (!pca) return null;
  await ensureInit();

  const cached = pca.getActiveAccount() ?? pca.getAllAccounts()[0] ?? null;
  if (cached) return cached;

  try {
    const result = await pca.ssoSilent({ scopes: API_SCOPES });
    pca.setActiveAccount(result.account);
    return result.account;
  } catch {
    return null; // no silent session — host owns interactive login
  }
};

export interface TokenOptions {
  forceRefresh?: boolean;
}

export const getAccessToken = async (
  opts: TokenOptions = {},
): Promise<string | null> => {
  if (!pca) return null;

  const account = await ensureAccount();
  if (!account) return null;

  try {
    const result = await pca.acquireTokenSilent({
      account,
      scopes: API_SCOPES,
      forceRefresh: opts.forceRefresh,
    });
    return result.accessToken;
  } catch (e) {
    // Silent-only: don't prompt. Let the caller proceed token-less.
    if (e instanceof InteractionRequiredAuthError) return null;
    throw e;
  }
};
