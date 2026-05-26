import type { WorldTheme } from "@/lib/types";
import { getWorldTheme } from "@/data/worlds";
import { MAP_SEGMENT_SIZE } from "@/lib/constants";

export type MapNodeKind = "question" | "checkpoint" | "boss";

export interface RunWorldBoss {
  id: string;
  name: string;
  emoji: string;
}

export interface RunWorldDefinition {
  id: number;
  title: string;
  difficulty: 1 | 2 | 3;
  boss: RunWorldBoss;
  themeIndex: number;
  /** Visual node types for the 5 map nodes (4 questions + finale). */
  nodeKinds: MapNodeKind[];
  unlockTitle?: string;
}

/** Four worlds × 5 stages = 20-question run. */
export const RUN_WORLDS: RunWorldDefinition[] = [
  {
    id: 1,
    title: "FOOD KINGDOM",
    difficulty: 1,
    boss: { id: "food-king", name: "THE FOOD KING", emoji: "🍕" },
    themeIndex: 0,
    nodeKinds: ["question", "question", "checkpoint", "question", "boss"],
    unlockTitle: "CHAOS WORLD",
  },
  {
    id: 2,
    title: "MOVIE DRAGON LAIR",
    difficulty: 2,
    boss: { id: "movie-dragon", name: "MOVIE DRAGON", emoji: "🎬" },
    themeIndex: 4,
    nodeKinds: ["question", "question", "checkpoint", "question", "boss"],
    unlockTitle: "TECH MEADOWS",
  },
  {
    id: 3,
    title: "TECH MEADOWS",
    difficulty: 2,
    boss: { id: "tech-goblin", name: "TECH GOBLIN", emoji: "💻" },
    themeIndex: 8,
    nodeKinds: ["question", "question", "checkpoint", "question", "boss"],
    unlockTitle: "UNDERGROUND",
  },
  {
    id: 4,
    title: "CHAOS SPIRE",
    difficulty: 3,
    boss: { id: "chaos-queen", name: "CHAOS QUEEN", emoji: "👑" },
    themeIndex: 12,
    nodeKinds: ["question", "question", "checkpoint", "question", "boss"],
    unlockTitle: "FINAL CASTLE",
  },
];

export const RUN_WORLD_COUNT = RUN_WORLDS.length;

export function getRunWorld(worldId: number): RunWorldDefinition {
  return (
    RUN_WORLDS.find((w) => w.id === worldId) ??
    RUN_WORLDS[RUN_WORLDS.length - 1]
  );
}

export function getRunWorldTheme(worldId: number): WorldTheme {
  const world = getRunWorld(worldId);
  return getWorldTheme(world.themeIndex);
}

export function questionIndexToWorldId(questionIndex: number): number {
  return Math.floor(questionIndex / MAP_SEGMENT_SIZE) + 1;
}

export function questionIndexToStageIndex(questionIndex: number): number {
  return (questionIndex % MAP_SEGMENT_SIZE) + 1;
}

export function worldProgressToQuestionIndex(
  worldId: number,
  stageIndex: number
): number {
  const clampedStage = Math.min(
    Math.max(stageIndex, 1),
    MAP_SEGMENT_SIZE
  );
  return (worldId - 1) * MAP_SEGMENT_SIZE + (clampedStage - 1);
}
