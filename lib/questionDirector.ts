import {
  BASE_POOL,
  SPECIAL_QUESTIONS,
  getPoolQuestion,
  shuffle,
  type PoolQuestion,
} from "@/data/questionPool";
import { getWorldTheme } from "@/data/worlds";
import type { Question, QuestionResult } from "@/lib/types";
import { SAVE_VERSION } from "@/lib/constants";

const DIRECTOR_KEY = "super-opinion-bros-director";

const BLOCK_RECENT = 15;
const UNSEEN_WEIGHT = 3;
const WILDCARD_EVERY = 5;

export interface QuestionStat {
  timesSeen: number;
  lastSeen: number;
}

export interface DirectorState {
  version: number;
  stats: Record<string, QuestionStat>;
  recentIds: string[];
  runCounter: number;
}

function loadDirectorState(): DirectorState {
  if (typeof window === "undefined") {
    return { version: SAVE_VERSION, stats: {}, recentIds: [], runCounter: 0 };
  }
  try {
    const raw = localStorage.getItem(DIRECTOR_KEY);
    if (!raw) {
      return { version: SAVE_VERSION, stats: {}, recentIds: [], runCounter: 0 };
    }
    return {
      version: SAVE_VERSION,
      stats: {},
      recentIds: [],
      runCounter: 0,
      ...JSON.parse(raw),
    };
  } catch {
    return { version: SAVE_VERSION, stats: {}, recentIds: [], runCounter: 0 };
  }
}

function saveDirectorState(state: DirectorState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      DIRECTOR_KEY,
      JSON.stringify({ ...state, version: SAVE_VERSION })
    );
  } catch {
    /* quota */
  }
}

function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function poolToQuestion(pq: PoolQuestion, worldIndex: number): Question {
  const theme = getWorldTheme(worldIndex);
  const result: QuestionResult = {
    winner: pq.votes.winner,
    percentA: pq.votes.percentA,
    percentB: pq.votes.percentB,
    totalVotes: pq.votes.total,
  };
  return {
    id: pq.id,
    world: worldIndex + 1,
    worldName: theme.name,
    kingdom: pq.special ? "WILD CARD" : theme.kingdom,
    title: pq.text,
    emoji: pq.emoji,
    optionA: pq.options.a,
    optionB: pq.options.b,
    result,
  };
}

function weightedPick(
  pool: PoolQuestion[],
  rng: () => number,
  stats: Record<string, QuestionStat>
): PoolQuestion | null {
  if (pool.length === 0) return null;
  const weights = pool.map((q) => {
    const seen = stats[q.id]?.timesSeen ?? 0;
    return seen === 0 ? UNSEEN_WEIGHT : 1;
  });
  const total = weights.reduce((a, b) => a + b, 0);
  let roll = rng() * total;
  for (let i = 0; i < pool.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return pool[i];
  }
  return pool[pool.length - 1];
}

function recordPick(
  state: DirectorState,
  id: string
): void {
  const now = Date.now();
  const prev = state.stats[id] ?? { timesSeen: 0, lastSeen: 0 };
  state.stats[id] = {
    timesSeen: prev.timesSeen + 1,
    lastSeen: now,
  };
  state.recentIds = [id, ...state.recentIds.filter((x) => x !== id)].slice(
    0,
    BLOCK_RECENT
  );
}

export function buildRunWithDirector(
  runLength: number,
  seed: number,
  categoryFilter?: string | null
): {
  questions: Question[];
  runQuestionIds: string[];
  seed: number;
} {
  const state = loadDirectorState();
  state.runCounter += 1;
  const rng = mulberry32(seed);

  let pool = BASE_POOL.filter(
    (q) => !state.recentIds.includes(q.id)
  );
  if (pool.length < runLength) {
    pool = [...BASE_POOL];
  }

  if (categoryFilter) {
    const filtered = pool.filter((q) => q.category === categoryFilter);
    if (filtered.length >= Math.min(5, runLength)) {
      pool = filtered;
    }
  }

  const picked: PoolQuestion[] = [];
  const poolCopy = [...pool];

  for (let slot = 0; slot < runLength; slot++) {
    const isWildcardSlot =
      (slot + 1) % WILDCARD_EVERY === 0 && runLength >= WILDCARD_EVERY;
    if (isWildcardSlot) {
      const wild = shuffle(SPECIAL_QUESTIONS)[0];
      picked.push(wild);
      recordPick(state, wild.id);
      continue;
    }

    const choice = weightedPick(poolCopy, rng, state.stats);
    if (!choice) break;
    picked.push(choice);
    recordPick(state, choice.id);
    const idx = poolCopy.findIndex((q) => q.id === choice.id);
    if (idx >= 0) poolCopy.splice(idx, 1);
  }

  while (picked.length < runLength && poolCopy.length > 0) {
    const choice = weightedPick(poolCopy, rng, state.stats);
    if (!choice) break;
    picked.push(choice);
    recordPick(state, choice.id);
    const idx = poolCopy.findIndex((q) => q.id === choice.id);
    if (idx >= 0) poolCopy.splice(idx, 1);
  }

  saveDirectorState(state);

  const questions = picked.map((pq, i) => poolToQuestion(pq, i));
  return {
    questions,
    runQuestionIds: picked.map((q) => q.id),
    seed,
  };
}

export function createRunSeed(): number {
  return Math.floor(Math.random() * 0x7fffffff);
}

export { getPoolQuestion };
