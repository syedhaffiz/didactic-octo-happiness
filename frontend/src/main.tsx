// Standalone entry (npm run dev / build / preview).
//
// Auth is owned by the host, so when the remote runs on its own there's no
// MSAL instance and no token — use this mode for UI work against mock data. In
// the portal the app is loaded via Module Federation (see expose-app.tsx),
// where the host provides the MsalProvider above it.

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./theme/fonts.css";
import "./index.css";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
