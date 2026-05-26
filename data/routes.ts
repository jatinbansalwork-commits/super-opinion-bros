import type { SecretRoute, WorldTheme } from "@/lib/types";

export const ROUTE_THEMES: Record<SecretRoute, Partial<WorldTheme>> = {
  default: {},
  crowd: {
    kingdom: "CROWD KINGDOM",
    sky: "#5C94FC",
    ground: "#43B047",
    accent: "#FBD000",
    decor: "👑",
  },
  chaos: {
    kingdom: "CHAOS WORLD",
    sky: "#FF006E",
    ground: "#8338EC",
    accent: "#FFBE0B",
    decor: "🔥",
  },
  glitch: {
    kingdom: "GLITCH LAND",
    sky: "#0D1B2A",
    ground: "#1B263B",
    accent: "#00F5D4",
    decor: "⚡",
  },
};

/** @deprecated Use ROUTE_DISPLAY_NAMES for map UI. */
export const ROUTE_LABELS: Record<SecretRoute, string> = {
  default: "MAIN ROAD",
  crowd: "CROWD KINGDOM",
  chaos: "CHAOS WORLD",
  glitch: "GLITCH LAND",
};

export const ROUTE_DISPLAY_NAMES: Record<
  Exclude<SecretRoute, "default">,
  string
> = {
  crowd: "Crowd Route",
  chaos: "Chaos Route",
  glitch: "Glitch Route",
};
