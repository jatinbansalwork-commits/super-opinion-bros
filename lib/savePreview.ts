import { ROUTE_DISPLAY_NAMES } from "@/data/routes";
import { loadResumableSave } from "@/lib/saveRules";
import { normalizeSaveProgress } from "@/lib/saveProgress";
import type { SecretRoute } from "@/lib/types";

export interface SavePreview {
  worldLabel: string;
  routeLabel: string;
  progressPercent: number;
}

function routeLabel(route: SecretRoute): string {
  if (route === "default") return "Main Road";
  return ROUTE_DISPLAY_NAMES[route];
}

export function getSavePreview(): SavePreview | null {
  const saved = loadResumableSave();
  if (!saved) return null;

  const progress = normalizeSaveProgress(saved);
  const runLength = saved.runLength ?? 20;
  const answered = saved.answers?.length ?? saved.answeredIds?.length ?? 0;
  const progressPercent = Math.min(
    100,
    Math.round((answered / Math.max(runLength, 1)) * 100)
  );

  return {
    worldLabel: `World ${progress.worldId}`,
    routeLabel: routeLabel(saved.route ?? "default"),
    progressPercent,
  };
}
