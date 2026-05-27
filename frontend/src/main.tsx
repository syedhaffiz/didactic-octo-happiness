import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

const rootEl = document.getElementById("root")!;

// Render a clear, dev-friendly screen if SSO env vars are missing instead of
// crashing with a stack trace. Real apps in deployed envs will always have
// the vars set; this exists so a teammate who forgets `.env.local` gets a
// helpful nudge.
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

// Imports that throw on missing config (msalConfig) happen inside `bootstrap`
// — so we can catch and present a friendly error instead of a blank page.
(async () => {
  try {
    const [{ bootstrapAuth }, { AuthProvider }, { ErrorBoundary }, { ThemeProvider }, { router }] =
      await Promise.all([
        import("./auth/bootstrap"),
        import("./auth/AuthProvider"),
        import("./components/ErrorBoundary"),
        import("./theme/ThemeProvider"),
        import("./routes"),
      ]);

    await import("./theme/fonts.css");
    await import("./index.css");

    await bootstrapAuth();

    const { RouterProvider } = await import("react-router-dom");

    createRoot(rootEl).render(
      <StrictMode>
        <ErrorBoundary>
          <ThemeProvider>
            <AuthProvider>
              <RouterProvider router={router} />
            </AuthProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </StrictMode>,
    );
  } catch (err) {
    const isConfigError =
      err instanceof Error && err.name === "MissingAuthConfigError";
    if (isConfigError) {
      renderConfigError((err as Error).message);
    } else {
      // Anything else — surface to console and re-throw so the dev sees it.
      console.error("[bootstrap] failed", err);
      renderConfigError(
        (err instanceof Error ? err.message : String(err)) +
          " — check the browser console for details.",
      );
    }
  }
})();
