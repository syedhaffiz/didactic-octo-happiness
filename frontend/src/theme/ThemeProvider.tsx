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

    // Sidebar menu colors (the Sider is always light-themed). antd has no
    // token for the open-submenu blue title bar / light-blue panel, so we
    // express those colors here and apply them via CSS in index.css.
    root.setProperty("--ct-menu-active-bg", brand.accent);
    root.setProperty("--ct-menu-active-color", brand.white);
    root.setProperty("--ct-submenu-bg", brand.accentSoft);
    root.setProperty("--ct-menu-child-color", brand.black);
    root.setProperty("--ct-menu-child-active", brand.accent);
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
