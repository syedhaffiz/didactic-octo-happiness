// App entry. Boots MSAL when SSO is enabled (no-op otherwise), then mounts.
// The sign-in gate and identity wiring live in <AuthProvider> inside <App>.

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

const rootEl = document.getElementById("root")!;

const renderConfigError = (message: string) => {
  rootEl.innerHTML = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 640px; margin: 80px auto; padding: 32px; border: 1px solid #ffccc7; background: #fff2f0; border-radius: 8px;">
      <h2 style="margin: 0 0 12px; color: #cf1322;">Auth configuration missing</h2>
      <p style="margin: 0 0 16px; color: #434343; line-height: 1.5;">${message}</p>
      <p style="margin: 0; color: #595959; font-size: 13px;">
        Once fixed, stop and restart <code>npm --prefix frontend run dev</code>
        (Vite reads env vars only at startup).
      </p>
    </div>
  `;
};

(async () => {
  try {
    const [{ bootstrapAuth }, { App }] = await Promise.all([
      import("./auth/bootstrap"),
      import("./App"),
    ]);

    await import("./theme/fonts.css");
    await import("./index.css");

    await bootstrapAuth();

    createRoot(rootEl).render(
      <StrictMode>
        <App />
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
