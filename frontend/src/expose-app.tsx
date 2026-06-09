// Module Federation exposed entry.
//
// The host imports this via:
//   const RemoteApp = (await import("nr_irm_fe/App")).default;
//   <RemoteApp basename="/irm" />
//
// The host must:
//   1. Authenticate the user, then pass its MSAL instance to RemoteApp:
//        <RemoteApp basename="/irm" msalInstance={instance} />
//      The remote acquires tokens silently on that instance (host's app
//      registration). The remote has no MSAL config and no sign-out.
//   2. Mount RemoteApp under the basename it allocated for us.
//   3. Share react, react-dom, react-router-dom, and antd as singletons
//      (see vite.config.ts `shared`). MSAL is NOT shared — the instance is
//      passed by prop and used duck-typed.

import "./theme/fonts.css";
import "./index.css";
import App from "./App";

export default App;
