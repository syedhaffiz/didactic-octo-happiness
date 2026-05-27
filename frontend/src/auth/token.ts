// Token acquisition helpers used by the axios interceptor.
//
// `getAccessToken` does silent token acquisition against MSAL's cache.
// When the cache is empty or expired, it falls back to an interactive
// redirect — same UX as fresh sign-in.

import {
  InteractionRequiredAuthError,
  type AccountInfo,
} from "@azure/msal-browser";
import { API_SCOPES, pca } from "./msalConfig";

const activeAccount = (): AccountInfo | null =>
  pca.getActiveAccount() ?? pca.getAllAccounts()[0] ?? null;

export interface TokenOptions {
  forceRefresh?: boolean;
}

export const getAccessToken = async (
  opts: TokenOptions = {},
): Promise<string | null> => {
  const account = activeAccount();
  // No account yet — caller will retry once MsalAuthenticationTemplate
  // finishes the sign-in redirect and an account becomes available.
  if (!account) return null;

  try {
    const result = await pca.acquireTokenSilent({
      account,
      scopes: API_SCOPES,
      forceRefresh: opts.forceRefresh,
    });
    return result.accessToken;
  } catch (e) {
    // Cache miss or consent change — only fall back to interactive flow
    // when MSAL explicitly says so. Anything else is propagated.
    if (e instanceof InteractionRequiredAuthError) {
      await pca.acquireTokenRedirect({ scopes: API_SCOPES, account });
      return null; // redirect navigates away; the await never resolves
    }
    throw e;
  }
};

export const signOut = async () => {
  const account = activeAccount();
  await pca.logoutRedirect({ account: account ?? undefined });
};
