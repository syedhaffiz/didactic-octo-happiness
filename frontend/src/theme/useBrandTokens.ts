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

    // Accent-tinted surfaces (KPI icon chip). The Figma uses light blue.
    accentBg: isDark ? "rgba(63, 130, 230, 0.20)" : "#CFDFFC",
    accentText: isDark ? "#7FB0E8" : "#0D66CA",

    // Headline value color (dark navy in light, near-white in dark).
    headline: isDark ? "rgba(255,255,255,0.92)" : "#0E275B",

    // Panels — the tinted "Breakdown" section container.
    panelBg: isDark ? "rgba(255,255,255,0.03)" : "#DFEAF9",

    // Forex card surface (white like other cards) + light-blue stat tiles.
    forexCardBg: token.colorBgContainer,
    forexTileBg: isDark ? "rgba(126, 179, 255, 0.14)" : "#E7EFFE",
    forexTileText: isDark ? "#9DC0F0" : "#1E3A5F",

    // Account-number links in ledger tables.
    linkBlue: isDark ? "#7FB0E8" : "#0D66CA",

    // Breakdown sub-card headline value (navy blue).
    breakdownValue: isDark ? "#9DC0F0" : "#1F5BA8",

    // Delta colors (green up, red down) — brightened slightly in dark.
    deltaUp: isDark ? "#46C97A" : "#1BA05A",
    deltaDown: isDark ? "#FF6B6B" : "#D14343",

    isDark,
  };
};
