// Single source of truth for every color in the app.
// Colors are recovered from the Figma PNG exports — those exports are uniformly
// darkened (max channel value 229), so sampled values were scaled by 255/229.
//
// RULE: no color literal (#hex / rgb / rgba) may appear anywhere else in the
// codebase. Components read colors from `useBrandTokens()`; the antd theme and
// chart helpers read them from the exports below.
// The brand name itself is intentionally never used as an identifier.

// ---------------------------------------------------------------------------
// Light palette — the default theme.
// ---------------------------------------------------------------------------
export const brand = {
  // Primary purple (brand identity / chart accents)
  purple: "#5E267F",
  purpleDark: "#3A1A57",
  purpleDeep: "#370373", // deep violet — profitability columns
  purpleSoft: "#EDE7F6",

  // Interactive accent — the Figma uses blue for nav, badges and controls
  accent: "#0D66CA",
  accentSoft: "#CFDFFC", // icon badge / selected nav fill
  accentHover: "#EAF1FF", // menu + table row hover
  accentTrack: "#E6ECF6", // segmented control track

  // Neutrals
  grey: "#6B6B6B",
  greyLight: "#E5E7EB",
  black: "#1B2333", // body text
  headline: "#0E275B", // navy — large KPI / breakdown values
  white: "#FFFFFF",
  textMuted: "#7A8194",
  textSubtle: "#5A6172", // menu item text
  textTableHead: "#4A5168", // table header text

  // Secondary
  green: "#1BA05A",
  blue: "#0D66CA",
  orange: "#F36C2A",
  danger: "#D14343",

  // App surfaces
  bg: "#F3F6FB", // page background (cool light blue-grey)
  cardBg: "#FFFFFF",
  border: "#E3E7EF",

  // Tinted surfaces
  panelBlue: "#DFEAF9", // "Breakdown" section panel
  tableHeader: "#DCDAF7", // lavender table header row
  forexTile: "#E7EFFE", // forex stat tiles
  breakdownValue: "#1F5BA8", // breakdown sub-card value
  headerSolid: "#5B5890", // gradient midpoint — solid fallback

  // Header gradient — left blue → right crimson; the midpoint is the
  // purple seen in the screenshot.
  gradient: "linear-gradient(90deg, #0D73B3 0%, #AE3C6D 100%)",
  gradientDark: "linear-gradient(90deg, #0A557F 0%, #7C2D4F 100%)",
} as const;

// ---------------------------------------------------------------------------
// Dark palette — surface + accent values used only when the dark theme is on.
// ---------------------------------------------------------------------------
export const brandDark = {
  header: "#3A2E52",
  sider: "#141414",
  body: "#0F0F0F",
  tableHeader: "#211E2A",
  accentText: "#7FB0E8",
  value: "#9DC0F0",
  deltaUp: "#46C97A",
  deltaDown: "#FF6B6B",
  menuSelectedBg: "rgba(63, 130, 230, 0.22)",
  accentBg: "rgba(63, 130, 230, 0.20)",
  headline: "rgba(255, 255, 255, 0.92)",
  panelBg: "rgba(255, 255, 255, 0.03)",
  forexTileBg: "rgba(126, 179, 255, 0.14)",
} as const;

// ---------------------------------------------------------------------------
// Chart palettes.
// ---------------------------------------------------------------------------

// Highcharts generic series palette.
export const chartPalette = [
  brand.accent,
  brand.purple,
  brand.green,
  brand.orange,
  brand.grey,
  brand.purpleDeep,
] as const;

// Sales "Budget vs Actual" series colors — pinned to the Figma exports.
export const chartSeries = {
  budget: "#7FC4FD",
  actual: "#1E3A5F",
  actualAlt: "#610A85", // zonewise "Actual" reads purple in the Figma
} as const;

// Donut slice colors — matches the Figma legend order (SNS / SEB / TPH / Sagarmala).
export const donutColors = ["#4A6CD4", "#36B45C", "#F2992E", "#07DBFB", "#9B5BD0"] as const;

// KPI sparkline colors — the Figma colors each metric column distinctly.
export const kpiSparkColors: Record<string, string> = {
  revenue: "#8E5BC4",
  workingCapital: "#8E5BC4",
  sales: "#F4795F",
  dispatch: "#F4795F",
  profitability: "#46C4D4",
  inventoryDays: "#46C4D4",
};

// Profitability column chart color.
export const profitColumn = brand.purpleDeep;

// Approved Budget chart colors.
export const approvedBudgetSeries = {
  budget: "#7FC4FD", // light blue line — matches Sales Budget
  actual: "#1B2333", // near-black line — matches body ink
} as const;

export const inventoryColors = {
  seb: "#A678D6", // lighter purple slice
  sns: brand.purpleDeep, // deep purple slice
} as const;

// PBD column chart color (dark navy bars).
export const pbdColumn = "#1F2A6B";

export const fontFamily = '"Poppins", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
