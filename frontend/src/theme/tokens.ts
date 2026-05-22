// Brand design tokens — colors recovered from the Figma PNG exports.
// The exports are uniformly darkened (max channel value 229), so sampled
// values were scaled by 255/229 to recover the true design colors.
// The brand name itself is intentionally never used as an identifier.

export const brand = {
  // Primary purple (brand identity / chart accents)
  purple: "#5E267F",
  purpleDark: "#3A1A57",
  purpleDeep: "#370373", // deep violet — profitability columns
  purpleSoft: "#EDE7F6",

  // Interactive accent — the Figma uses blue for nav, badges and controls
  accent: "#0D66CA",
  accentSoft: "#CFDFFC",

  // Neutrals
  grey: "#6B6B6B",
  greyLight: "#E5E7EB",
  black: "#1B2333", // body text
  headline: "#0E275B", // navy — large KPI / breakdown values
  white: "#FFFFFF",

  // Secondary
  green: "#1BA05A",
  blue: "#0D66CA",
  orange: "#F36C2A",

  // App surfaces
  bg: "#F3F6FB", // page background (cool light blue-grey)
  cardBg: "#FFFFFF",
  border: "#E3E7EF",
  textMuted: "#7A8194",

  // Tinted surfaces
  panelBlue: "#DFEAF9", // "Breakdown" section panel
  tableHeader: "#DCDAF7", // lavender table header row
  forexTile: "#E7EFFE", // forex stat tiles

  // Header gradient — left blue → right crimson; the midpoint is the
  // purple seen in the screenshot. Reserved for the app header bar.
  gradient: "linear-gradient(90deg, #0D73B3 0%, #AE3C6D 100%)",
  gradientDark: "linear-gradient(90deg, #0A557F 0%, #7C2D4F 100%)",
} as const;

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

export const fontFamily = '"Poppins", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
