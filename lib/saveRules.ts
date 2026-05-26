import { normalizeSaveProgress } from "@/lib/saveProgress";
import {
  archiveSave,
  isSaveExpired,
  loadSave,
  type PersistedSave,
} from "@/lib/storage";

/** Resume only if save < 72h and stage > 1 (or past first question). */
export function canResumeSave(saved: PersistedSave): boolean {
  if (isSaveExpired(saved.timestamp)) return false;
  const progress = normalizeSaveProgress(saved);
  const stage = saved.stageIndex ?? progress.stageIndex;
  const answered = saved.answers?.length ?? 0;
  return stage > 1 || answered > 0;
}

export function loadResumableSave(): PersistedSave | null {
  const saved = loadSave();
  if (!saved) return null;
  if (!canResumeSave(saved)) {
    archiveSave(saved);
    return null;
  }
  return saved;
}

export function hasResumableSave(): boolean {
  return loadResumableSave() !== null;
}
