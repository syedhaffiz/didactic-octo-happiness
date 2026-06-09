// Type for the federated remote module. The remote exposes `./App`, the
// IRM (Integrated Resource Management) root component. `basename` mounts it
// under a sub-path; `msalInstance` is the host's PublicClientApplication, which
// the remote uses to acquire API tokens silently (it has no MSAL config of its
// own).
declare module "nr_irm_fe/App" {
  import type { ComponentType } from "react";
  import type { IPublicClientApplication } from "@azure/msal-browser";
  const App: ComponentType<{
    basename?: string;
    msalInstance?: IPublicClientApplication;
  }>;
  export default App;
}
