// Token acquisition for the axios interceptor.
//
// The token comes from the host's MSAL instance (registered via setActivePca).
// If the host hasn't mounted us yet, or the remote is running standalone, there
// is no instance/account and we attach no token — the request goes out
// unauthenticated (fine for mock-data dev; the real backend would 401).

import {
  InteractionRequiredAuthError,
  type AccountInfo,
  type IPublicClientApplication,
} from "@azure/msal-browser";
import { API_SCOPES, getActivePca } from "./msalConfig";

const activeAccount = (pca: IPublicClientApplication): AccountInfo | null =>
  pca.getActiveAccount() ?? pca.getAllAccounts()[0] ?? null;

export interface TokenOptions {
  forceRefresh?: boolean;
}

export const getAccessToken = async (
  opts: TokenOptions = {},
): Promise<string | null> => {
  const pca = getActivePca();
  if (!pca) return null; // host hasn't mounted us / running standalone

  const account = activeAccount(pca);
  if (!account) return null;

  try {
    const result = await pca.acquireTokenSilent({
      account,
      scopes: API_SCOPES,
      forceRefresh: opts.forceRefresh,
    });
    return result.accessToken;
  } catch (e) {
    if (e instanceof InteractionRequiredAuthError) {
      await pca.acquireTokenRedirect({ scopes: API_SCOPES, account });
      return null;
    }
    throw e;
  }
};

export const signOut = async () => {
  const pca = getActivePca();
  if (!pca) return;
  const account = activeAccount(pca);
  await pca.logoutRedirect({ account: account ?? undefined });
};
