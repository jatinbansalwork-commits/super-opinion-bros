import type { QuestionModifier } from "@/lib/types";

export type SurpriseType =
  | "hot-take"
  | "reverse-internet"
  | "main-character"
  | "silent-majority"
  | "speed-round"
  | "food-war";

export interface RunSurprise {
  type: SurpriseType;
  questionIndex: number;
}

export const SURPRISE_DEFS: {
  type: SurpriseType;
  emoji: string;
  title: string;
  hint: string;
}[] = [
  {
    type: "hot-take",
    emoji: "🔥",
    title: "HOT TAKE",
    hint: "Double coin reward",
  },
  {
    type: "reverse-internet",
    emoji: "🌀",
    title: "REVERSE INTERNET",
    hint: "Minority wins",
  },
  {
    type: "main-character",
    emoji: "👑",
    title: "MAIN CHARACTER",
    hint: "Bonus result multiplier",
  },
  {
    type: "silent-majority",
    emoji: "🗳",
    title: "SILENT MAJORITY",
    hint: "Hide percentages",
  },
  {
    type: "speed-round",
    emoji: "⚡",
    title: "SPEED ROUND",
    hint: "Instant reveal",
  },
  {
    type: "food-war",
    emoji: "🍔",
    title: "FOOD WAR",
    hint: "Food category takeover",
  },
];

const SURPRISE_CHANCE = 0.075;
const MIN_GAP = 2;

function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function buildRunSurprises(
  runLength: number,
  seed: number
): Map<number, RunSurprise> {
  const rng = mulberry32(seed ^ 0x9e3779b9);
  const map = new Map<number, RunSurprise>();
  let lastSurpriseAt = -MIN_GAP;

  for (let i = 0; i < runLength; i++) {
    if (i - lastSurpriseAt < MIN_GAP) continue;
    if (rng() > SURPRISE_CHANCE) continue;

    const def = SURPRISE_DEFS[Math.floor(rng() * SURPRISE_DEFS.length)]!;
    map.set(i, { type: def.type, questionIndex: i });
    lastSurpriseAt = i;
  }

  if (map.size === 0 && runLength >= 3) {
    const idx = 2 + Math.floor(rng() * Math.max(1, runLength - 3));
    const def = SURPRISE_DEFS[Math.floor(rng() * SURPRISE_DEFS.length)]!;
    map.set(idx, { type: def.type, questionIndex: idx });
  }

  return map;
}

export function surpriseToModifier(type: SurpriseType): QuestionModifier | null {
  switch (type) {
    case "hot-take":
      return "double-reward";
    case "reverse-internet":
      return "crowd-flip";
    case "silent-majority":
      return "votes-hidden";
    default:
      return null;
  }
}

export function getSurpriseDef(type: SurpriseType) {
  return SURPRISE_DEFS.find((d) => d.type === type);
}
