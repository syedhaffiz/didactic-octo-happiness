// Token acquisition helpers used by the axios interceptor.
//
// When SSO is OFF we short-circuit to a dummy token so the API contract
// (Authorization: Bearer <token>) stays identical for the backend. When SSO
// is ON we acquire a real bearer token silently from MSAL.

import {
  InteractionRequiredAuthError,
  type AccountInfo,
} from "@azure/msal-browser";
import { API_SCOPES, DUMMY_TOKEN, SSO_ENABLED, pca } from "./msalConfig";

const activeAccount = (): AccountInfo | null =>
  pca?.getActiveAccount() ?? pca?.getAllAccounts()[0] ?? null;

export interface TokenOptions {
  forceRefresh?: boolean;
}

export const getAccessToken = async (
  opts: TokenOptions = {},
): Promise<string | null> => {
  // SSO off — every request carries the dummy token.
  if (!SSO_ENABLED) return DUMMY_TOKEN;

  if (!pca) return null;

  const account = activeAccount();
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
  // No session to end when SSO is off.
  if (!SSO_ENABLED || !pca) return;
  const account = activeAccount();
  await pca.logoutRedirect({ account: account ?? undefined });
};
