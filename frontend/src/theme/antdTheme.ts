import type { ThemeConfig } from "antd";
import { theme as antdTheme } from "antd";
import { brand, brandDark, fontFamily } from "./tokens";

export const lightTheme: ThemeConfig = {
  algorithm: antdTheme.defaultAlgorithm,
  token: {
    colorPrimary: brand.accent,
    colorInfo: brand.accent,
    colorLink: brand.accent,
    colorBgLayout: brand.bg,
    colorBgContainer: brand.cardBg,
    colorBorder: brand.border,
    colorBorderSecondary: brand.border,
    colorText: brand.black,
    colorTextSecondary: brand.textMuted,
    fontFamily,
    borderRadius: 10,
  },
  components: {
    Layout: {
      // Header bar uses a gradient applied directly on the element;
      // this solid value is only a fallback.
      headerBg: brand.headerSolid,
      headerColor: brand.white,
      siderBg: brand.white,
      bodyBg: brand.bg,
      headerHeight: 60,
    },
    Menu: {
      itemSelectedBg: brand.accentSoft,
      itemSelectedColor: brand.accent,
      itemHoverBg: brand.accentHover,
      itemColor: brand.textSubtle,
      itemHeight: 38,
      subMenuItemBg: "transparent",
      itemBorderRadius: 8,
      iconSize: 15,
    },
    Card: {
      borderRadiusLG: 14,
      colorBorderSecondary: brand.border,
    },
    Table: {
      headerBg: brand.tableHeader,
      headerColor: brand.textTableHead,
      headerSplitColor: "transparent",
      borderColor: brand.border,
      rowHoverBg: brand.accentHover,
      cellPaddingBlock: 12,
    },
    Segmented: {
      itemSelectedBg: brand.accent,
      itemSelectedColor: brand.white,
      trackBg: brand.accentTrack,
      itemColor: brand.textSubtle,
    },
  },
};

// Dark mode: page chrome follows antd's dark algorithm so text contrast
// stays high; the header keeps its (darker) gradient.
export const darkTheme: ThemeConfig = {
  algorithm: antdTheme.darkAlgorithm,
  token: {
    colorPrimary: brand.accent,
    colorInfo: brand.accent,
    colorLink: brandDark.accentText,
    fontFamily,
    borderRadius: 10,
  },
  components: {
    Layout: {
      headerBg: brandDark.header,
      headerColor: brand.white,
      siderBg: brandDark.sider,
      bodyBg: brandDark.body,
      headerHeight: 60,
    },
    Menu: {
      darkItemSelectedBg: brandDark.menuSelectedBg,
      darkItemSelectedColor: brandDark.accentText,
      itemHeight: 38,
      itemBorderRadius: 8,
    },
    Card: {
      borderRadiusLG: 14,
    },
    Table: {
      headerBg: brandDark.tableHeader,
      cellPaddingBlock: 12,
    },
    Segmented: {
      itemSelectedBg: brand.accent,
      itemSelectedColor: brand.white,
    },
  },
};
