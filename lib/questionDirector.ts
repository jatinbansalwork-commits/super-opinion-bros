import {
  catalogToPoolShape,
  filterCatalogByCategory,
  getAllCatalogQuestions,
  getCatalogQuestion,
} from "@/lib/questionCatalog";
import type { CatalogQuestion, QuestionCategory } from "@/lib/questionCatalog/types";
import {
  getBlockedFromRecentRuns,
  getQuestionStats,
  loadDirectorHistory,
  recordRunInHistory,
  saveDirectorHistory,
} from "@/lib/questionHistory";
import { rollQuestionModifier } from "@/lib/questionModifiers";
import { applyQuestionSurprises } from "@/lib/surprise/applyRunSurprises";
import type { Question, QuestionModifier } from "@/lib/types";

const UNSEEN_WEIGHT_MULT = 5;
const RECENCY_RUN_GAP = 10;

function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function selectionWeight(
  q: CatalogQuestion,
  history: ReturnType<typeof loadDirectorHistory>,
  runCounter: number
): number {
  const stats = getQuestionStats(history, q.id);
  let w = q.weight;

  if (stats.shown === 0) {
    w *= UNSEEN_WEIGHT_MULT;
  } else {
    w /= 1 + stats.shown * 0.35;
  }

  if (stats.lastSeenRun > 0 && runCounter - stats.lastSeenRun < RECENCY_RUN_GAP) {
    w *= 0.08;
  }

  if (q.rarity === "rare") w *= 0.75;
  if (q.rarity === "uncommon") w *= 0.9;

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

function normalizeCategoryFilter(
  filter?: string | null
): QuestionCategory | null {
  if (!filter) return null;
  const f = filter.toLowerCase();
  if (f === "meme" || f === "wildcard") return "chaos";
  if (
    f === "food" ||
    f === "internet" ||
    f === "culture" ||
    f === "tech" ||
    f === "chaos"
  ) {
    return f;
  }
  return null;
}

export function buildRunWithDirector(
  runLength: number,
  seed: number,
  categoryFilter?: string | null
): {
  questions: Question[];
  runQuestionIds: string[];
  questionModifiers: Record<string, QuestionModifier>;
  seed: number;
} {
  const history = loadDirectorHistory();
  const runCounter = history.runCounter + 1;
  const rng = mulberry32(seed);
  const blockedRecent = getBlockedFromRecentRuns(history);
  const pickedThisRun = new Set<string>();

  let pool = getAllCatalogQuestions().filter(
    (q) => !blockedRecent.has(q.id)
  );

  const cat = normalizeCategoryFilter(categoryFilter);
  if (cat) {
    const filtered = filterCatalogByCategory(cat);
    if (filtered.length >= Math.min(5, runLength)) {
      pool = filtered.filter((q) => !blockedRecent.has(q.id));
    }
  }

  if (pool.length < runLength) {
    pool = getAllCatalogQuestions().filter((q) => !pickedThisRun.has(q.id));
  }

  const picked: CatalogQuestion[] = [];
  let poolCopy = [...pool];

  while (picked.length < runLength && poolCopy.length > 0) {
    const available = poolCopy.filter((q) => !pickedThisRun.has(q.id));
    if (available.length === 0) break;

    const choice = weightedPick(available, rng, history, runCounter);
    if (!choice) break;

    picked.push(choice);
    pickedThisRun.add(choice.id);
    poolCopy = poolCopy.filter((q) => q.id !== choice.id);
  }

  if (picked.length < runLength) {
    const remaining = getAllCatalogQuestions().filter(
      (q) => !pickedThisRun.has(q.id)
    );
    for (const q of remaining) {
      if (picked.length >= runLength) break;
      picked.push(q);
      pickedThisRun.add(q.id);
    }
  }

  const questionIds = picked.map((q) => q.id);
  const nextHistory = recordRunInHistory(history, questionIds);
  saveDirectorHistory(nextHistory);

  const questionModifiers: Record<string, QuestionModifier> = {};
  for (const q of picked) {
    const mod = rollQuestionModifier(rng);
    if (mod) questionModifiers[q.id] = mod;
  }

  const { questions } = applyQuestionSurprises(picked, seed);

  return {
    questions,
    runQuestionIds: questions.map((q) => q.id),
    questionModifiers,
    seed,
  };
}

export function createRunSeed(): number {
  return Math.floor(Math.random() * 0x7fffffff);
}

/** @deprecated Use getCatalogQuestion */
export function getPoolQuestion(id: string) {
  const cq = getCatalogQuestion(id);
  return cq ? catalogToPoolShape(cq) : undefined;
}
