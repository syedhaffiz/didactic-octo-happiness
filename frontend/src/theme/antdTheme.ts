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

export const darkTheme: ThemeConfig = {
  algorithm: antdTheme.darkAlgorithm,
  token: {
    colorPrimary: brand.purple,
    colorInfo: brand.purple,
    colorLink: brand.purple,
    fontFamily,
    borderRadius: 10,
  },
  components: {
    Layout: {
      headerBg: brand.purpleDark,
      headerColor: brand.white,
    },
  },
};
