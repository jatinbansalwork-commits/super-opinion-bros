import { MAP_SEGMENT_SIZE } from "@/lib/constants";
import type { GameMode } from "@/lib/types";

export type { GameMode };

export interface GameModeDefinition {
  id: GameMode;
  title: string;
  subtitle: string;
  lines: string[];
  stars: number;
  recommended?: boolean;
  runLength: number;
  bosses: boolean;
  routes: boolean;
  powerUps: boolean;
}

export function starsDisplay(count: number): string {
  return "★".repeat(count);
}

export const GAME_MODES: GameModeDefinition[] = [
  {
    id: "casual",
    title: "CASUAL",
    subtitle: "5 Questions",
    lines: ["Quick run"],
    stars: 1,
    runLength: 5,
    bosses: false,
    routes: false,
    powerUps: false,
  },
  {
    id: "adventure",
    title: "ADVENTURE",
    subtitle: "10 Questions",
    lines: ["Boss battles"],
    stars: 3,
    recommended: true,
    runLength: 10,
    bosses: true,
    routes: false,
    powerUps: true,
  },
  {
    id: "chaos",
    title: "CHAOS",
    subtitle: "Routes · Bosses · Secrets",
    lines: ["Routes", "Bosses", "Secrets"],
    stars: 5,
    runLength: 20,
    bosses: true,
    routes: true,
    powerUps: true,
  },
];

export function getGameModeDefinition(mode: GameMode): GameModeDefinition {
  return GAME_MODES.find((m) => m.id === mode) ?? GAME_MODES[2];
}

export function runLengthForMode(mode: GameMode): number {
  return getGameModeDefinition(mode).runLength;
}

export function worldCountForRunLength(runLength: number): number {
  return Math.ceil(runLength / MAP_SEGMENT_SIZE);
}

export function isBossMilestone(
  completedCount: number,
  mode: GameMode,
  runLength: number
): boolean {
  const def = getGameModeDefinition(mode);
  if (!def.bosses) return false;
  if (completedCount % MAP_SEGMENT_SIZE !== 0) return false;
  return completedCount <= runLength;
}

export function featuresForMode(mode: GameMode) {
  const def = getGameModeDefinition(mode);
  return {
    bosses: def.bosses,
    routes: def.routes,
    powerUps: def.powerUps,
  };
}
