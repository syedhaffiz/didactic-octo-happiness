// Brand design tokens. Values pinned from the brand guideline swatches and the
// Figma screen exports. The brand name itself is intentionally never used as an identifier.

export const brand = {
  // Primary
  purple: "#5E267F",
  purpleDark: "#3A1A57",
  purpleSoft: "#F1ECF9", // lavender — icon badges, selected menu item
  grey: "#6B6B6B",
  greyLight: "#E5E7EB",
  black: "#1B2333", // dark navy used for headline values in the Figma
  white: "#FFFFFF",

  // Secondary (used sparingly to break monotony per the brand guideline)
  green: "#1BA05A",
  blue: "#1E60AA",
  orange: "#F36C2A",

  // App surfaces
  bg: "#EEF0F4", // page background
  cardBg: "#FFFFFF",
  border: "#E6E8EE",
  textMuted: "#7A8194",
} as const;

// Highcharts generic series palette — purple-led, with greys and brand secondaries.
export const chartPalette = [
  brand.purple,
  brand.grey,
  brand.blue,
  brand.green,
  brand.orange,
  brand.purpleDark,
] as const;

// Sales "Budget vs Actual" series colors — pinned to the Figma exports.
export const chartSeries = {
  budget: "#7FB3FF",
  actual: "#1F2A6B",
} as const;

// Donut slice colors — matches the Figma legend order (SNS / SEB / TPH / Sagarmala).
export const donutColors = ["#4A6CD4", "#3BA35A", "#E8943A", "#3FC5D6", "#9B5BD0"] as const;

// KPI sparkline colors — the Figma colors each metric column distinctly
// (violet for col 1, coral for col 2, cyan for col 3). Decorative, not trend-based.
export const kpiSparkColors: Record<string, string> = {
  revenue: "#8E5BC4",
  workingCapital: "#8E5BC4",
  sales: "#F4795F",
  dispatch: "#F4795F",
  profitability: "#46C4D4",
  inventoryDays: "#46C4D4",
};

// Profitability column chart color.
export const profitColumn = "#4A2A78";

export const fontFamily = '"Poppins", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
