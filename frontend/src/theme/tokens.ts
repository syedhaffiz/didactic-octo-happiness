// Brand design tokens. Values pinned from brand guideline swatches.
// The brand name itself is intentionally not used in any identifier.

export const brand = {
  // Primary
  purple: "#5E267F",
  purpleDark: "#3A1A57",
  purpleSoft: "#F4EEFA",
  grey: "#6B6B6B",
  greyLight: "#E5E7EB",
  black: "#1F1F1F",
  white: "#FFFFFF",

  // Secondary (use sparingly per brand guideline)
  green: "#1BA05A",
  blue: "#1E60AA",
  orange: "#F36C2A",

  // App surfaces
  bg: "#F5F6FA",
  cardBg: "#FFFFFF",
  border: "#EAECF0",
  textMuted: "#6B7280",
} as const;

// Highcharts series palette — purple-led, with greys and brand secondaries.
export const chartPalette = [
  brand.purple,
  brand.grey,
  brand.blue,
  brand.green,
  brand.orange,
  brand.purpleDark,
] as const;

export const fontFamily =
  '"Poppins", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
