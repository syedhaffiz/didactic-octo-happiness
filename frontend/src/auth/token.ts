// Token acquisition for the axios interceptor, using the host's MSAL instance
// (provided via the App's `msalInstance` prop). The host already signed the
// user in, so the instance has an active account and acquireTokenSilent
// returns a fresh token.
//
// Silent-only: if a token can't be obtained without interaction, we return null
// rather than prompting — interactive login (and sign-out) belong to the host.
// We check error codes by string (not `instanceof`) so no MSAL runtime import
// is needed and host/remote msal-browser versions don't have to match.

import type { AccountInfo, IPublicClientApplication } from "@azure/msal-browser";
import { API_SCOPES, getMsalInstance } from "./hostMsal";

const INTERACTION_CODES = new Set([
  "interaction_required",
  "login_required",
  "consent_required",
  "no_account_error",
]);

const activeAccount = (pca: IPublicClientApplication): AccountInfo | null =>
  pca.getActiveAccount() ?? pca.getAllAccounts()[0] ?? null;

export interface TokenOptions {
  forceRefresh?: boolean;
}

export const getAccessToken = async (
  opts: TokenOptions = {},
): Promise<string | null> => {
  const pca = getMsalInstance();
  if (!pca) return null; // no host instance (standalone) → unauthenticated

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
    const code = (e as { errorCode?: string }).errorCode;
    if (code && INTERACTION_CODES.has(code)) return null;
    throw e;
  }
};
