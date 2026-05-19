import { ConfigProvider } from "antd";
import { useMemo, useState, type ReactNode } from "react";
import { darkTheme, lightTheme } from "./antdTheme";
import { ThemeContext, type ThemeCtx, type ThemeMode } from "./themeContext";

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") return "light";
    return (window.localStorage.getItem("ct-theme") as ThemeMode) ?? "light";
  });

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
