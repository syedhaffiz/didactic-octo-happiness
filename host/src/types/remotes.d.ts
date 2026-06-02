// Type for the federated remote module. The remote exposes `./App`, the
// IRM (Integrated Resource Management) root component. `basename` mounts it
// under a sub-path; it consumes the host's MSAL token (no auth props needed).
declare module "irm/App" {
  import type { ComponentType } from "react";
  const App: ComponentType<{ basename?: string }>;
  export default App;
}
