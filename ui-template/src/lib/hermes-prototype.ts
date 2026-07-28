// Prototype/demo mode flag. Prototype-only affordances (role switch, demo
// logins, "Prototype Mode" badge) are shown only when this is true.
// Set VITE_PROTOTYPE_MODE=false in a production build to hide them.
export const PROTOTYPE_MODE =
  (import.meta.env.VITE_PROTOTYPE_MODE ?? "true") !== "false";
