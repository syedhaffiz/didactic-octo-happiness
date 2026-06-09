// Module Federation exposed entry.
//
// The host imports this via:
//   const RemoteApp = (await import("nr_irm_fe/App")).default;
//   <RemoteApp basename="/irm" />
//
// The host must:
//   1. Wrap RemoteApp in its own MsalProvider + sign-in gate. The host owns
//      auth; the remote reads that account and registers the host's PCA with
//      its API interceptor via useActiveAccountSync — it never logs anyone in.
//   2. Mount RemoteApp under the basename it allocated for us.
//   3. Share react, react-dom, react-router-dom, @azure/msal-browser,
//      @azure/msal-react, and antd as singletons (see vite.config.ts `shared`).

import "./theme/fonts.css";
import "./index.css";
import App from "./App";

export default App;
