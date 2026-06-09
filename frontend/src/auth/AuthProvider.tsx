// Identity context for the remote.
//
// The remote signs in silently (ssoSilent) using its own app registration, so
// the only thing this exposes is the display name of that account. No sign-out
// (the host owns logout). When auth is disabled / no silent session exists, the
// name falls back to a placeholder and the app runs token-less.

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { ensureAccount } from "./token";

interface Identity {
  name: string;
}

const IdentityContext = createContext<Identity>({ name: "Account" });

export const useIdentity = (): Identity => useContext(IdentityContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [name, setName] = useState("Account");

  useEffect(() => {
    let cancelled = false;
    ensureAccount().then((account) => {
      if (!cancelled && account) {
        setName(account.name ?? account.username ?? "Account");
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return <IdentityContext.Provider value={{ name }}>{children}</IdentityContext.Provider>;
};
