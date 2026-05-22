import type { ThemeConfig } from "antd";
import { theme as antdTheme } from "antd";
import { brand, fontFamily } from "./tokens";

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
      headerBg: "#5B5890",
      headerColor: brand.white,
      siderBg: brand.white,
      bodyBg: brand.bg,
      headerHeight: 60,
    },
    Menu: {
      itemSelectedBg: brand.accentSoft,
      itemSelectedColor: brand.accent,
      itemHoverBg: "#EAF1FF",
      itemColor: "#5A6172",
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
      headerColor: "#4A5168",
      headerSplitColor: "transparent",
      borderColor: brand.border,
      rowHoverBg: "#EAF1FF",
      cellPaddingBlock: 12,
    },
    Segmented: {
      itemSelectedBg: brand.accent,
      itemSelectedColor: brand.white,
      trackBg: "#E6ECF6",
      itemColor: "#5A6172",
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
    colorLink: "#7FB0E8",
    fontFamily,
    borderRadius: 10,
  },
  components: {
    Layout: {
      headerBg: "#3A2E52",
      headerColor: brand.white,
      siderBg: "#141414",
      bodyBg: "#0F0F0F",
      headerHeight: 60,
    },
    Menu: {
      darkItemSelectedBg: "rgba(63, 130, 230, 0.22)",
      darkItemSelectedColor: "#7FB0E8",
      itemHeight: 38,
      itemBorderRadius: 8,
    },
    Card: {
      borderRadiusLG: 14,
    },
    Table: {
      headerBg: "#211E2A",
      cellPaddingBlock: 12,
    },
    Segmented: {
      itemSelectedBg: brand.accent,
      itemSelectedColor: brand.white,
    },
  },
};
