import {
  getAllCatalogQuestions,
  getCatalogByCategory,
  getCatalogQuestion,
} from "@/data/questionCatalog";
import type { CatalogQuestion, QuestionCategory } from "@/lib/questionCatalog/types";
import {
  getBlockedQuestionIds,
  getQuestionStats,
  loadDirectorHistory,
  recordRunInHistory,
  saveDirectorHistory,
} from "@/lib/questionHistory";
import { questionIndexToWorldId } from "@/data/runWorlds";
import { getWorldTheme } from "@/data/worlds";
import { displayQuestionTitle } from "@/lib/questionDisplay";
import type { Question, QuestionResult } from "@/lib/types";

const UNSEEN_WEIGHT_MULT = 6;
const GLOBAL_RECENCY_RUNS = 10;
const WORLD_POOL_WEIGHT = 0.7;
const ADJACENT_POOL_WEIGHT = 0.2;

const ADJACENT: Record<QuestionCategory, QuestionCategory[]> = {
  food: ["internet", "pop-culture"],
  internet: ["food", "tech", "pop-culture"],
  "pop-culture": ["internet", "food", "chaos"],
  culture: ["internet", "food", "chaos"],
  tech: ["internet", "chaos"],
  chaos: ["pop-culture", "random", "tech"],
  random: ["chaos", "internet", "food"],
};

const RARITY_WEIGHT: Record<string, number> = {
  common: 60,
  uncommon: 25,
  rare: 10,
  cursed: 5,
};

function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function worldCategoryForQuestionIndex(
  questionIndex: number
): QuestionCategory {
  const worldId = questionIndexToWorldId(questionIndex);
  switch (worldId) {
    case 1:
      return "food";
    case 2:
      return "pop-culture";
    case 3:
      return "tech";
    case 4:
      return "chaos";
    default:
      return "random";
  }
}

function poolToQuestion(cq: CatalogQuestion, worldIndex: number): Question {
  const theme = getWorldTheme(worldIndex);
  const result: QuestionResult = {
    winner: cq.votes.winner,
    percentA: cq.votes.percentA,
    percentB: cq.votes.percentB,
    totalVotes: cq.votes.total,
  };
  return {
    id: cq.id,
    world: worldIndex + 1,
    worldName: theme.name,
    kingdom:
      cq.rarity === "cursed"
        ? "CURSED POST"
        : cq.rarity === "rare"
          ? "RARE EVENT"
          : cq.special
            ? "WILD CARD"
            : theme.kingdom,
    title: displayQuestionTitle(cq.question),
    emoji: cq.emoji,
    optionA: cq.optionA,
    optionB: cq.optionB,
    result,
    isRare: cq.rarity === "rare" || cq.rarity === "cursed",
  };
}

function selectionWeight(
  q: CatalogQuestion,
  history: ReturnType<typeof loadDirectorHistory>,
  runCounter: number
): number {
  const stats = getQuestionStats(history, q.id);
  let w = q.weight * (RARITY_WEIGHT[q.rarity] ?? 10);

  if (stats.shown === 0) {
    w *= UNSEEN_WEIGHT_MULT;
  } else {
    w /= 1 + stats.shown * 0.4;
  }

  if (
    stats.lastSeenRun > 0 &&
    runCounter - stats.lastSeenRun < GLOBAL_RECENCY_RUNS
  ) {
    w *= 0.05;
  }

  return Math.max(w, 0.01);
}

function weightedPick(
  pool: CatalogQuestion[],
  rng: () => number,
  history: ReturnType<typeof loadDirectorHistory>,
  runCounter: number
): CatalogQuestion | null {
  if (pool.length === 0) return null;
  const weights = pool.map((q) => selectionWeight(q, history, runCounter));
  const total = weights.reduce((a, b) => a + b, 0);
  let roll = rng() * total;
  for (let i = 0; i < pool.length; i++) {
    roll -= weights[i]!;
    if (roll <= 0) return pool[i]!;
  }
  return pool[pool.length - 1] ?? null;
}

function pickPoolCategory(
  primary: QuestionCategory,
  rng: () => number
): QuestionCategory {
  const roll = rng();
  if (roll < WORLD_POOL_WEIGHT) return primary;
  if (roll < WORLD_POOL_WEIGHT + ADJACENT_POOL_WEIGHT) {
    const adj = ADJACENT[primary] ?? ADJACENT.random;
    return adj[Math.floor(rng() * adj.length)] ?? "random";
  }
  const wild = [
    "food",
    "internet",
    "pop-culture",
    "tech",
    "chaos",
    "random",
  ] as QuestionCategory[];
  return wild[Math.floor(rng() * wild.length)]!;
}

function normalizeCategoryFilter(
  filter?: string | null
): QuestionCategory | null {
  if (!filter) return null;
  const f = filter.toLowerCase();
  if (f === "meme" || f === "wildcard") return "chaos";
  if (f === "culture" || f === "pop" || f === "pop-culture") {
    return "pop-culture";
  }
  if (
    f === "food" ||
    f === "internet" ||
    f === "tech" ||
    f === "chaos" ||
    f === "random"
  ) {
    return f as QuestionCategory;
  }
  return null;
}

export function buildRunWithDirector(
  runLength: number,
  seed: number,
  categoryFilter?: string | null,
  forceCategory?: QuestionCategory | null
): {
  questions: Question[];
  runQuestionIds: string[];
  seed: number;
} {
  const history = loadDirectorHistory();
  const runCounter = history.runCounter + 1;
  const rng = mulberry32(seed);
  const blocked = getBlockedQuestionIds(history);
  const pickedThisRun = new Set<string>();
  const filterCat = normalizeCategoryFilter(categoryFilter);

  const picked: CatalogQuestion[] = [];

  for (let slot = 0; slot < runLength; slot++) {
    let targetCat =
      forceCategory ??
      filterCat ??
      pickPoolCategory(worldCategoryForQuestionIndex(slot), rng);

    if (targetCat === "culture") targetCat = "pop-culture";

    let pool = getCatalogByCategory(targetCat).filter(
      (q) => !blocked.has(q.id) && !pickedThisRun.has(q.id)
    );

    if (pool.length === 0) {
      pool = getAllCatalogQuestions().filter(
        (q) => !pickedThisRun.has(q.id) && !blocked.has(q.id)
      );
    }

    if (pool.length === 0) {
      pool = getAllCatalogQuestions().filter((q) => !pickedThisRun.has(q.id));
    }

    const choice = weightedPick(pool, rng, history, runCounter);
    if (!choice) break;

    picked.push(choice);
    pickedThisRun.add(choice.id);
  }

  const questionIds = picked.map((q) => q.id);
  const nextHistory = recordRunInHistory(history, questionIds);
  saveDirectorHistory(nextHistory);

  const questions = picked.map((pq, i) => poolToQuestion(pq, i));

  return {
    questions,
    runQuestionIds: questionIds,
    seed,
  };
}

export function createRunSeed(): number {
  return Math.floor(Math.random() * 0x7fffffff);
}

/** Swap one run slot to a category (e.g. food-war surprise). */
export function rebuildSlotWithCategory(
  questions: Question[],
  slotIndex: number,
  category: QuestionCategory,
  seed: number,
  excludeIds: Set<string>
): Question[] {
  const rng = mulberry32(seed + slotIndex * 5011);
  let pool = getCatalogByCategory(category).filter((q) => !excludeIds.has(q.id));
  if (pool.length === 0) {
    pool = getCatalogByCategory(category);
  }
  const pick = pool[Math.floor(rng() * pool.length)];
  if (!pick) return questions;
  const next = [...questions];
  next[slotIndex] = poolToQuestion(pick, slotIndex);
  return next;
}

/** @deprecated Use getCatalogQuestion */
export function getPoolQuestion(id: string) {
  const cq = getCatalogQuestion(id);
  return cq
    ? {
        id: cq.id,
        category: cq.category,
        text: cq.question,
        emoji: cq.emoji,
        options: { a: cq.optionA, b: cq.optionB },
        votes: {
          percentA: cq.votes.percentA,
          percentB: cq.votes.percentB,
          total: cq.votes.total,
          winner: cq.votes.winner,
        },
        special: cq.special,
      }
    : undefined;
}
