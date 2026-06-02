// Identity context for the remote.
//
// The host owns authentication. This provider reads the host-provided MSAL
// account (via useMsal) for the display name, registers the host's PCA with the
// axios interceptor (useActiveAccountSync), and exposes a sign-out action. The
// remote renders no MsalProvider and no sign-in gate of its own.
//
// When run standalone (no host), useMsal yields a stubbed instance with no
// accounts — the name falls back to a generic label and no token is attached.

import { createContext, useContext, type ReactNode } from "react";
import { useMsal } from "@azure/msal-react";
import { signOut } from "./token";
import { useActiveAccountSync } from "./useActiveAccountSync";

interface Identity {
  name: string;
  signOut: () => void;
}

const IdentityContext = createContext<Identity>({
  name: "Account",
  signOut: () => {},
});

export const useIdentity = (): Identity => useContext(IdentityContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  useActiveAccountSync();
  const { accounts } = useMsal();
  const name = accounts[0]?.name ?? accounts[0]?.username ?? "Account";

  return (
    <IdentityContext.Provider value={{ name, signOut: () => void signOut() }}>
      {children}
    </IdentityContext.Provider>
  );
};
