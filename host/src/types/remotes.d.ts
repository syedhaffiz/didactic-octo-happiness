// Type for the federated remote module. The remote exposes `./App`, the
// IRM (Integrated Resource Management) root component. `basename` mounts it
// under a sub-path; `ssoEnabled` tells it whether this host runs SSO.
declare module "irm/App" {
  import type { ComponentType } from "react";
  const App: ComponentType<{ basename?: string; ssoEnabled?: boolean }>;
  export default App;
}
