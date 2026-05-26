import type { DirectorHistory, CatalogQuestionStats } from "@/lib/questionCatalog/types";

const HISTORY_KEY = "super-opinion-bros-question-history";
const HISTORY_VERSION = 1;
const RUNS_TO_KEEP = 3;
const RUNS_TO_BLOCK = 2;

const EMPTY: DirectorHistory = {
  version: HISTORY_VERSION,
  runCounter: 0,
  recentRuns: [],
  questions: {},
};

export function loadDirectorHistory(): DirectorHistory {
  if (typeof window === "undefined") return { ...EMPTY };
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return { ...EMPTY };
    const data = JSON.parse(raw) as DirectorHistory;
    return {
      version: HISTORY_VERSION,
      runCounter: data.runCounter ?? 0,
      recentRuns: Array.isArray(data.recentRuns) ? data.recentRuns : [],
      questions: data.questions ?? {},
    };
  } catch {
    return { ...EMPTY };
  }
}

export function saveDirectorHistory(state: DirectorHistory): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      HISTORY_KEY,
      JSON.stringify({
        ...state,
        version: HISTORY_VERSION,
        recentRuns: state.recentRuns.slice(0, RUNS_TO_KEEP),
      })
    );
  } catch {
    /* quota */
  }
}

export function getBlockedFromRecentRuns(history: DirectorHistory): Set<string> {
  const blocked = new Set<string>();
  for (let i = 0; i < Math.min(RUNS_TO_BLOCK, history.recentRuns.length); i++) {
    for (const id of history.recentRuns[i] ?? []) {
      blocked.add(id);
    }
  }
  return blocked;
}

export function recordRunInHistory(
  history: DirectorHistory,
  questionIds: string[]
): DirectorHistory {
  const runCounter = history.runCounter + 1;
  const questions = { ...history.questions };

  for (const id of questionIds) {
    const prev: CatalogQuestionStats = questions[id] ?? {
      shown: 0,
      lastSeenRun: 0,
    };
    questions[id] = {
      shown: prev.shown + 1,
      lastSeenRun: runCounter,
    };
  }

  return {
    version: HISTORY_VERSION,
    runCounter,
    recentRuns: [questionIds, ...history.recentRuns].slice(0, RUNS_TO_KEEP),
    questions,
  };
}

export function getQuestionStats(
  history: DirectorHistory,
  id: string
): CatalogQuestionStats {
  return history.questions[id] ?? { shown: 0, lastSeenRun: 0 };
}
