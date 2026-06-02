// Token acquisition helpers used by the axios interceptor.
//
// Reads the *active* PCA via getActivePca() so the same path works standalone
// (our own instance) and federated (the host's instance, registered by
// AuthProvider on mount). When auth is inactive (standalone + SSO off) we
// short-circuit to a dummy token so the API contract stays identical.

import {
  InteractionRequiredAuthError,
  type AccountInfo,
  type IPublicClientApplication,
} from "@azure/msal-browser";
import { API_SCOPES, DUMMY_TOKEN, getActivePca, isAuthActive } from "./msalConfig";

const activeAccount = (pca: IPublicClientApplication): AccountInfo | null =>
  pca.getActiveAccount() ?? pca.getAllAccounts()[0] ?? null;

export interface TokenOptions {
  forceRefresh?: boolean;
}

export const getAccessToken = async (
  opts: TokenOptions = {},
): Promise<string | null> => {
  // Auth inactive (SSO off, or federated under a no-SSO host) — every request
  // carries the dummy token.
  if (!isAuthActive()) return DUMMY_TOKEN;

  const pca = getActivePca();
  if (!pca) return null; // federated mode before the host has mounted us

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
  if (!isAuthActive()) return; // no session to end
  const pca = getActivePca();
  if (!pca) return;
  const account = activeAccount(pca);
  await pca.logoutRedirect({ account: account ?? undefined });
};
