// Federation exposed module.
//
// The host imports this via:
//   const RemoteApp = (await import("control_tower/App")).default;
//   <RemoteApp basename="/control-tower" />
//
// The host must:
//   1. Wrap RemoteApp in its own MsalProvider (we use the host's PCA via
//      `useActiveAccountSync`).
//   2. Mount RemoteApp under the basename it allocated for us.
//   3. Share react, react-dom, react-router-dom, @azure/msal-browser, and
//      @azure/msal-react as singletons (see vite.config.ts `shared`).

import "./theme/fonts.css";
import "./index.css";
import App from "./App";

export default App;
