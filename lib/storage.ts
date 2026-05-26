import {
  PLAYER_KEY,
  SAVE_KEY,
  SAVE_MAX_AGE_MS,
  SAVE_VERSION,
  SETTINGS_KEY,
} from "@/lib/constants";
import type {
  AnswerChoice,
  BossState,
  CheckpointNext,
  GameMode,
  GamePhase,
  MapBranch,
  PlayerAnswer,
  PowerUpItem,
  RunModifiers,
  SecretRoute,
  WorldEventId,
} from "./types";

export const ARCHIVE_KEY = "super-opinion-bros-archive";

export interface PersistedSave {
  saveVersion?: number;
  phase: GamePhase;
  /** @deprecated Derived from worldId + stageIndex. Kept for migration. */
  currentQuestion: number;
  answers: PlayerAnswer[];
  pendingChoice?: AnswerChoice;
  runQuestionIds: string[];
  checkpointTargetWorld?: number;
  checkpointNext?: CheckpointNext;
  /** @deprecated Derived from worldId + stageIndex. Not written on new saves. */
  mapTargetWorld?: number;
  worldId?: number;
  stageIndex?: number;
  bossCompleted?: number[];
  answeredIds?: string[];
  bossState?: BossState | null;
  runCoins?: number;
  streak?: number;
  route?: SecretRoute;
  inventory?: PowerUpItem[];
  modifiers?: RunModifiers;
  gameMode?: GameMode;
  runLength?: number;
  runScore?: number;
  seed?: number;
  worldEvent?: WorldEventId;
  mapBranch?: MapBranch;
  exactStreak?: number;
  timestamp: number;
}

export interface GameSettings {
  version: string;
  usedQuestionIds: string[];
}

export interface PersistedPlayer {
  coins: number;
  xp: number;
  level: number;
  route: SecretRoute;
  inventory: PowerUpItem[];
  /** Career match % for rank display when no active run answers. */
  matchRate?: number;
  /** Best end-of-run identity. */
  bestResult?: string;
}

const DEFAULT_SETTINGS: GameSettings = {
  version: "3.0",
  usedQuestionIds: [],
};

const DEFAULT_PLAYER: PersistedPlayer = {
  coins: 0,
  xp: 0,
  level: 1,
  route: "default",
  inventory: [],
  matchRate: 0,
};

function isClient(): boolean {
  return typeof window !== "undefined";
}

function parseSave(raw: string): PersistedSave | null {
  try {
    const data = JSON.parse(raw) as PersistedSave;
    if (
      typeof data.timestamp !== "number" ||
      typeof data.currentQuestion !== "number" ||
      !Array.isArray(data.answers) ||
      !Array.isArray(data.runQuestionIds) ||
      !data.phase
    ) {
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export function isSaveExpired(timestamp: number): boolean {
  return Date.now() - timestamp > SAVE_MAX_AGE_MS;
}

export function loadSave(): PersistedSave | null {
  if (!isClient()) return null;
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const data = migrateSaveBlob(parseSave(raw));
    if (!data) {
      clearSave();
      return null;
    }
    if (isSaveExpired(data.timestamp)) {
      archiveSave(data);
      clearSave();
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export function migrateSaveBlob(
  data: PersistedSave | null
): PersistedSave | null {
  if (!data) return null;
  const version = data.saveVersion ?? 1;
  if (version < SAVE_VERSION) {
    return {
      ...data,
      saveVersion: SAVE_VERSION,
      runScore: data.runScore ?? 0,
      seed: data.seed ?? Math.floor(Math.random() * 1e9),
      worldEvent: data.worldEvent ?? "none",
      exactStreak: data.exactStreak ?? 0,
    };
  }
  return data;
}

export function archiveSave(data: PersistedSave): void {
  if (!isClient()) return;
  try {
    localStorage.setItem(
      ARCHIVE_KEY,
      JSON.stringify({ ...data, archivedAt: Date.now() })
    );
  } catch {
    /* quota */
  }
}

export function hasValidSave(): boolean {
  return loadSave() !== null;
}

export function saveProgress(data: Omit<PersistedSave, "timestamp">): void {
  if (!isClient()) return;
  try {
    const payload: PersistedSave = {
      ...data,
      saveVersion: SAVE_VERSION,
      timestamp: Date.now(),
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
  } catch {
    /* quota */
  }
}

export function clearSave(): void {
  if (!isClient()) return;
  localStorage.removeItem(SAVE_KEY);
}

export function loadSettings(): GameSettings {
  if (!isClient()) return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: Partial<GameSettings>): void {
  if (!isClient()) return;
  try {
    const next = { ...loadSettings(), ...settings };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  } catch {
    /* quota */
  }
}

export function loadUsedQuestionIds(): string[] {
  return loadSettings().usedQuestionIds ?? [];
}

export function saveUsedQuestionIds(ids: string[]): void {
  saveSettings({ usedQuestionIds: ids });
}

export function loadPlayer(): PersistedPlayer {
  if (!isClient()) return DEFAULT_PLAYER;
  try {
    const raw = localStorage.getItem(PLAYER_KEY);
    if (!raw) return DEFAULT_PLAYER;
    return { ...DEFAULT_PLAYER, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PLAYER;
  }
}

export function savePlayer(data: Partial<PersistedPlayer>): void {
  if (!isClient()) return;
  try {
    const next = { ...loadPlayer(), ...data };
    localStorage.setItem(PLAYER_KEY, JSON.stringify(next));
  } catch {
    /* quota */
  }
}

export function migrateLegacyStorage(): void {
  if (!isClient()) return;
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (
      ("musicEnabled" in parsed && !("timestamp" in parsed)) ||
      !("runQuestionIds" in parsed)
    ) {
      clearSave();
    }
  } catch {
    clearSave();
  }
}
