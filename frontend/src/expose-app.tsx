// Module Federation exposed entry.
//
// The host imports this via:
//   const RemoteApp = (await import("nr_irm_fe/App")).default;
//   <RemoteApp basename="/irm" />
//
// The host must:
//   1. Authenticate the user (any flow). The remote then signs in SILENTLY with
//      its own app registration (VITE_AZURE_CLIENT_ID/TENANT_ID) via ssoSilent,
//      riding that session — no prompt, no sign-out here. No auth props needed.
//   2. Mount RemoteApp under the basename it allocated for us.
//   3. Share react, react-dom, react-router-dom, and antd as singletons
//      (see vite.config.ts `shared`).
//
// NOTE: the remote's app registration must list the HOST's origin as an SPA
// redirect URI (the silent iframe runs on the host's origin at runtime).

import "./theme/fonts.css";
import "./index.css";
import App from "./App";

export default App;
