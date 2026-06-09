// Identity context for the remote.
//
// The host passes its MSAL instance via the App's `msalInstance` prop. This
// provider registers that instance for the axios interceptor and reads the
// signed-in account's name for the header. The remote has no MSAL config, no
// app registration, and no sign-out (logout is the host's job).
//
// Standalone (no instance prop) → token-less, placeholder name.

import { createContext, useContext, type ReactNode } from "react";
import type { IPublicClientApplication } from "@azure/msal-browser";
import { setMsalInstance } from "./hostMsal";

interface Identity {
  name: string;
}

const IdentityContext = createContext<Identity>({ name: "Account" });

export const useIdentity = (): Identity => useContext(IdentityContext);

export const AuthProvider = ({
  children,
  msalInstance,
}: {
  children: ReactNode;
  msalInstance?: IPublicClientApplication;
}) => {
  // Register synchronously (during render) so the interceptor has the instance
  // before any child route fires a request.
  setMsalInstance(msalInstance ?? null);

  const account = msalInstance?.getActiveAccount() ?? msalInstance?.getAllAccounts()[0];
  const name = account?.name ?? account?.username ?? "Account";

  return <IdentityContext.Provider value={{ name }}>{children}</IdentityContext.Provider>;
};
