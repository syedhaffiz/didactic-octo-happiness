import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

const rootEl = document.getElementById("root")!;

(async () => {
  try {
    const [{ bootstrapAuth }, { App }] = await Promise.all([
      import("./auth/bootstrap"),
      import("./App"),
    ]);

    await bootstrapAuth();

    createRoot(rootEl).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  } catch (err) {
    console.error("[host bootstrap] failed", err);
    rootEl.innerHTML = `
      <div style="font-family: system-ui, sans-serif; max-width: 640px; margin: 80px auto; padding: 32px; border: 1px solid #ffccc7; background: #fff2f0; border-radius: 8px;">
        <h2 style="margin: 0 0 12px; color: #cf1322;">Host failed to start</h2>
        <p style="margin: 0; color: #434343; line-height: 1.5;">${
          err instanceof Error ? err.message : String(err)
        }</p>
      </div>`;
  }
})();
