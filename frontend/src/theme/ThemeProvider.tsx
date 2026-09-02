import { ConfigProvider } from "antd";
import { useLayoutEffect, useMemo, useState, type ReactNode } from "react";
import { darkTheme, lightTheme } from "./antdTheme";
import { brand, brandDark } from "./tokens";
import { ThemeContext, type ThemeCtx, type ThemeMode } from "./themeContext";

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") return "light";
    return (window.localStorage.getItem("ct-theme") as ThemeMode) ?? "light";
  });

  // Card elevation is CSS (antd has no Card box-shadow token); feed the
  // mode-aware shadow from tokens.ts into the --ct-card-shadow variable.
  useLayoutEffect(() => {
    const root = document.documentElement.style;
    const shadow = mode === "dark" ? brandDark.cardShadow : brand.cardShadow;
    root.setProperty("--ct-card-shadow", shadow);

    // Icon-rail + hover-flyout colors. The Sider is always light-themed, so
    // these are fixed light values (mode-independent) like the legacy menu
    // vars. antd has no token for the rail pill / flyout list, so the colors
    // live here and are applied via the .ct-rail* / .ct-flyout* classes in
    // index.css. Color literals stay confined to tokens.ts.
    // Active/selected → solid blue pill with white icon + label.
    root.setProperty("--ct-rail-active-bg", brand.accent);
    root.setProperty("--ct-rail-active-color", brand.white);
    // Hover → light-blue pill with blue icon + label.
    root.setProperty("--ct-rail-hover-bg", brand.accentHover);
    root.setProperty("--ct-rail-hover-color", brand.accent);
    root.setProperty("--ct-rail-color", brand.textSubtle);
    root.setProperty("--ct-rail-muted", brand.textMuted);
    root.setProperty("--ct-subnav-dot", brand.textMuted);
    root.setProperty("--ct-subnav-color", brand.textSubtle);
    root.setProperty("--ct-subnav-active", brand.accent);
  }, [mode]);

  const value = useMemo<ThemeCtx>(
    () => ({
      mode,
      toggle: () =>
        setMode((prev) => {
          const next: ThemeMode = prev === "light" ? "dark" : "light";
          window.localStorage.setItem("ct-theme", next);
          return next;
        }),
    }),
    [mode],
  );

  return (
    <ThemeContext.Provider value={value}>
      <ConfigProvider theme={mode === "light" ? lightTheme : darkTheme}>{children}</ConfigProvider>
    </ThemeContext.Provider>
  );
};
