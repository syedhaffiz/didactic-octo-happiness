// Token acquisition helpers used by the axios interceptor.
//
// Reads the *active* PCA via `getActivePca()` so the same code path works in
// both standalone mode (our own instance) and federated mode (the host's
// instance, registered by App.tsx on mount).

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
  if (!pca) return null; // federated mode before host has mounted us

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
