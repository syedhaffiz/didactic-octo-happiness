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
      itemHoverBg: brand.purpleSoft,
    },
    Card: {
      borderRadiusLG: 12,
    },
  },
};

// Dark mode: keep brand purple as the accent, but page chrome (sider, body,
// menu surfaces) follow antd's dark algorithm so text contrast stays high.
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
    },
    Card: {
      borderRadiusLG: 12,
    },
  },
};
