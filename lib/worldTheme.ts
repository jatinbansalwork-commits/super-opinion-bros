import { ROUTE_THEMES } from "@/data/routes";
import { getRunWorldTheme, questionIndexToWorldId } from "@/data/runWorlds";
import type { SecretRoute, WorldTheme } from "@/lib/types";

export function getThemedWorld(
  worldIndex: number,
  route: SecretRoute = "default"
): WorldTheme {
  const worldId = questionIndexToWorldId(worldIndex);
  const base = getRunWorldTheme(worldId);
  if (route === "default") return base;
  const override = ROUTE_THEMES[route];
  return {
    ...base,
    ...override,
    name: base.name,
    id: base.id,
  };
}
