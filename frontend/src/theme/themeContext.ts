import { createContext, useContext } from "react";

export type ThemeMode = "light" | "dark";

export interface ThemeCtx {
  mode: ThemeMode;
  toggle: () => void;
}

export const ThemeContext = createContext<ThemeCtx | null>(null);

export const useThemeMode = (): ThemeCtx => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useThemeMode must be used inside ThemeProvider");
  return ctx;
};
