import { theme } from "antd";
import { useThemeMode } from "./themeContext";

// Returns theme-aware colors so each component renders correctly in both light and dark.
// Anything that was previously hardcoded to a brand surface should be read from here.
export const useBrandTokens = () => {
  const { mode } = useThemeMode();
  const { token } = theme.useToken();
  const isDark = mode === "dark";

  return {
    text: token.colorText,
    textSecondary: token.colorTextSecondary,
    textMuted: token.colorTextTertiary,
    cardBg: token.colorBgContainer,
    border: token.colorBorder,
    pageBg: token.colorBgLayout,

    // Brand-purple-tinted surfaces (KPI icon chip, Forex stat tiles).
    accentBg: isDark ? "rgba(149, 95, 197, 0.18)" : "#F1ECF9",
    accentText: isDark ? "#C9A6E5" : "#5E267F",

    // Headline value color (dark navy in light, near-white in dark).
    headline: isDark ? "rgba(255,255,255,0.92)" : "#1B2333",

    // Panels — the tinted "Breakdown" section container.
    panelBg: isDark ? "rgba(255,255,255,0.03)" : "#E9ECF3",

    // Forex card surface + stat tiles.
    forexCardBg: isDark ? token.colorBgContainer : "#EEF1FA",
    forexTileBg: isDark ? "rgba(126, 179, 255, 0.14)" : "#DCE5F5",
    forexTileText: isDark ? "#9DC0F0" : "#2B3F6B",

    // Account-number links in ledger tables.
    linkBlue: isDark ? "#7FB0E8" : "#1E60AA",

    // Breakdown sub-card headline value (navy blue).
    breakdownValue: isDark ? "#9DC0F0" : "#23457E",

    // Delta colors (green up, red down) — brightened slightly in dark.
    deltaUp: isDark ? "#46C97A" : "#1BA05A",
    deltaDown: isDark ? "#FF6B6B" : "#D14343",

    isDark,
  };
};
