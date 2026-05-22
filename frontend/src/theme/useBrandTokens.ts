import { theme } from "antd";
import { useThemeMode } from "./themeContext";
import { brand, brandDark } from "./tokens";

// Returns theme-aware colors so every component renders correctly in both
// light and dark. Components must read colors from here (or from the chart
// token exports) — never inline a color literal.
export const useBrandTokens = () => {
  const { mode } = useThemeMode();
  const { token } = theme.useToken();
  const isDark = mode === "dark";

  return {
    // antd-derived surface tokens (already theme-aware)
    text: token.colorText,
    textSecondary: token.colorTextSecondary,
    textMuted: token.colorTextTertiary,
    cardBg: token.colorBgContainer,
    border: token.colorBorder,
    pageBg: token.colorBgLayout,

    // Accent-tinted surfaces (KPI icon chip). The Figma uses light blue.
    accentBg: isDark ? brandDark.accentBg : brand.accentSoft,
    accentText: isDark ? brandDark.accentText : brand.accent,

    // Headline value color (dark navy in light, near-white in dark).
    headline: isDark ? brandDark.headline : brand.headline,

    // Panels — the tinted "Breakdown" section container.
    panelBg: isDark ? brandDark.panelBg : brand.panelBlue,

    // Forex card surface (white like other cards) + light-blue stat tiles.
    forexCardBg: token.colorBgContainer,
    forexTileBg: isDark ? brandDark.forexTileBg : brand.forexTile,
    forexTileText: isDark ? brandDark.value : brand.headline,

    // Account-number links in ledger tables.
    linkBlue: isDark ? brandDark.accentText : brand.accent,

    // Breakdown sub-card headline value (navy blue).
    breakdownValue: isDark ? brandDark.value : brand.breakdownValue,

    // Delta colors (green up, red down).
    deltaUp: isDark ? brandDark.deltaUp : brand.green,
    deltaDown: isDark ? brandDark.deltaDown : brand.danger,

    isDark,
  };
};
