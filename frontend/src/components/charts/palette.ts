// Shared chart color parameters — the categorical order used by every chart
// in this library. Fixed order, never cycled or reassigned per-filter (per
// the dataviz skill: "color follows the entity, never its rank"). Reuses the
// hues already established in the Billing module rather than introducing a
// second competing palette.
export const CATEGORICAL_COLORS = [
  "#2a78d6", // blue
  "#1baf7a", // emerald
  "#e34948", // rose
  "#f0a020", // amber
  "#8b5cf6", // violet
  "#0891b2", // cyan
] as const;

export const STATUS_COLORS = {
  good: "#1baf7a",
  warning: "#f0a020",
  serious: "#e08a3c",
  critical: "#e34948",
} as const;

/** Single default hue for sequential/magnitude series (e.g. one fee-collection bar). */
export const SEQUENTIAL_COLOR = "#2a78d6";
