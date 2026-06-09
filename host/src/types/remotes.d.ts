// Type for the federated remote module. The remote exposes `./App`, the
// IRM (Integrated Resource Management) root component. `basename` mounts it
// under a sub-path; the remote signs in silently on its own, so the host
// injects no auth props.
declare module "nr_irm_fe/App" {
  import type { ComponentType } from "react";
  const App: ComponentType<{ basename?: string }>;
  export default App;
}
