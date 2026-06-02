// Module Federation exposed entry.
//
// The host imports this via:
//   const RemoteApp = (await import("irm/App")).default;
//   <RemoteApp basename="/irm" />
//
// The host must:
//   1. Build this remote with VITE_FEDERATED=true (npm run build:remote /
//      dev:remote) so AuthProvider skips its own MsalProvider and uses the
//      host's.
//   2. Wrap RemoteApp in its own MsalProvider + sign-in gate (the host owns
//      SSO; we register its PCA via useActiveAccountSync).
//   3. Mount RemoteApp under the basename it allocated for us.
//   4. Share react, react-dom, react-router-dom, @azure/msal-browser,
//      @azure/msal-react, and antd as singletons (see vite.config.ts `shared`).

import "./theme/fonts.css";
import "./index.css";
import App from "./App";

export default App;
