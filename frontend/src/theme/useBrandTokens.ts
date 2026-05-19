import { theme } from "antd";
import { useThemeMode } from "./themeContext";

// Returns theme-aware colors so each component renders correctly in both light and dark.
// Anything that was previously hardcoded to `brand.black` / `brand.textMuted` / brand surfaces
// should be read from here instead.
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
    accentBg: isDark ? "rgba(149, 95, 197, 0.18)" : "#F4EEFA",
    accentText: isDark ? "#C9A6E5" : "#5E267F",

    // Delta colors (green up, red down) — slightly brightened in dark for legibility.
    deltaUp: isDark ? "#46C97A" : "#1BA05A",
    deltaDown: isDark ? "#FF6B6B" : "#D14343",

    isDark,
  };
};
