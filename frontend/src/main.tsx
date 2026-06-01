// Standalone entry. Boots MSAL using our own PCA, wraps the App with
// MsalProvider + MsalAuthenticationTemplate (sign-in gate), and mounts.
//
// The exposed federation module is `src/expose-app.tsx` instead — it skips
// the bootstrap and the standalone auth wrapper because the host owns those.

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

const rootEl = document.getElementById("root")!;

const renderConfigError = (message: string) => {
  rootEl.innerHTML = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 640px; margin: 80px auto; padding: 32px; border: 1px solid #ffccc7; background: #fff2f0; border-radius: 8px;">
      <h2 style="margin: 0 0 12px; color: #cf1322;">Auth configuration missing</h2>
      <p style="margin: 0 0 16px; color: #434343; line-height: 1.5;">${message}</p>
      <p style="margin: 0; color: #595959; font-size: 13px;">
        Once the file exists, stop and restart <code>npm --prefix frontend run dev</code>
        (Vite reads env vars only at startup).
      </p>
    </div>
  `;
};

(async () => {
  try {
    const [{ bootstrapAuth }, { StandaloneAuthProvider }, { App }] = await Promise.all([
      import("./auth/bootstrap"),
      import("./auth/AuthProvider"),
      import("./App"),
    ]);

    await import("./theme/fonts.css");
    await import("./index.css");

    await bootstrapAuth();

    createRoot(rootEl).render(
      <StrictMode>
        <StandaloneAuthProvider>
          <App />
        </StandaloneAuthProvider>
      </StrictMode>,
    );
  } catch (err) {
    const isConfigError = err instanceof Error && err.name === "MissingAuthConfigError";
    if (isConfigError) {
      renderConfigError((err as Error).message);
    } else {
      console.error("[bootstrap] failed", err);
      renderConfigError(
        (err instanceof Error ? err.message : String(err)) +
          " — check the browser console for details.",
      );
    }
  }
})();
