import type { ThemeConfig } from "antd";
import { theme as antdTheme } from "antd";
import { brand, fontFamily } from "./tokens";

export const lightTheme: ThemeConfig = {
  algorithm: antdTheme.defaultAlgorithm,
  token: {
    colorPrimary: brand.purple,
    colorInfo: brand.purple,
    colorLink: brand.purple,
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
      headerBg: brand.purple,
      headerColor: brand.white,
      siderBg: brand.white,
      bodyBg: brand.bg,
      headerHeight: 56,
    },
    Menu: {
      itemSelectedBg: brand.purpleSoft,
      itemSelectedColor: brand.purple,
      itemHoverBg: "#F6F3FB",
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
      headerBg: "#ECE8F4",
      headerColor: "#5A6172",
      headerSplitColor: "transparent",
      borderColor: brand.border,
      rowHoverBg: "#F6F3FB",
      cellPaddingBlock: 12,
    },
    Segmented: {
      itemSelectedBg: brand.purple,
      itemSelectedColor: brand.white,
      trackBg: "#EFEBF6",
      itemColor: "#5A6172",
    },
  },
};

// Dark mode: keep brand purple as the accent, but page chrome follows antd's
// dark algorithm so text contrast stays high.
export const darkTheme: ThemeConfig = {
  algorithm: antdTheme.darkAlgorithm,
  token: {
    colorPrimary: brand.purple,
    colorInfo: brand.purple,
    colorLink: "#C9A6E5",
    fontFamily,
    borderRadius: 10,
  },
  components: {
    Layout: {
      headerBg: brand.purpleDark,
      headerColor: brand.white,
      siderBg: "#141414",
      bodyBg: "#0F0F0F",
      headerHeight: 56,
    },
    Menu: {
      darkItemSelectedBg: "rgba(149, 95, 197, 0.22)",
      darkItemSelectedColor: "#C9A6E5",
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
      itemSelectedBg: brand.purple,
      itemSelectedColor: brand.white,
    },
  },
};
