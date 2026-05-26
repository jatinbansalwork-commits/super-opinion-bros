import type { DirectorHistory, CatalogQuestionStats } from "@/lib/questionCatalog/types";

const HISTORY_KEY = "super-opinion-bros-question-history";
const HISTORY_VERSION = 2;
const RUNS_TO_KEEP = 10;
const GLOBAL_RUN_BLOCK = 10;
const SESSION_MAX = 50;

const EMPTY: DirectorHistory = {
  version: HISTORY_VERSION,
  runCounter: 0,
  recentRuns: [],
  sessionRecent: [],
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
      sessionRecent: Array.isArray(data.sessionRecent)
        ? data.sessionRecent
        : [],
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
        sessionRecent: state.sessionRecent.slice(0, SESSION_MAX),
      })
    );
  } catch {
    /* quota */
  }
}

/** IDs blocked from last 10 runs + last 50 session questions. */
export function getBlockedQuestionIds(history: DirectorHistory): Set<string> {
  const blocked = new Set<string>();

  for (const id of history.sessionRecent) {
    blocked.add(id);
  }

  for (let i = 0; i < Math.min(GLOBAL_RUN_BLOCK, history.recentRuns.length); i++) {
    for (const id of history.recentRuns[i] ?? []) {
      blocked.add(id);
    }
  }

  return blocked;
}

export function touchSessionQuestion(
  history: DirectorHistory,
  questionId: string
): DirectorHistory {
  const sessionRecent = [
    questionId,
    ...history.sessionRecent.filter((id) => id !== questionId),
  ].slice(0, SESSION_MAX);
  return { ...history, sessionRecent };
}

export function recordRunInHistory(
  history: DirectorHistory,
  questionIds: string[]
): DirectorHistory {
  const runCounter = history.runCounter + 1;
  const questions = { ...history.questions };
  let sessionRecent = [...history.sessionRecent];

  for (const id of questionIds) {
    const prev: CatalogQuestionStats = questions[id] ?? {
      shown: 0,
      lastSeenRun: 0,
    };
    questions[id] = {
      shown: prev.shown + 1,
      lastSeenRun: runCounter,
    };
    sessionRecent = [id, ...sessionRecent.filter((x) => x !== id)].slice(
      0,
      SESSION_MAX
    );
  }

  return {
    version: HISTORY_VERSION,
    runCounter,
    recentRuns: [questionIds, ...history.recentRuns].slice(0, RUNS_TO_KEEP),
    sessionRecent,
    questions,
  };
}

export function getQuestionStats(
  history: DirectorHistory,
  id: string
): CatalogQuestionStats {
  return history.questions[id] ?? { shown: 0, lastSeenRun: 0 };
}

/** @deprecated Use getBlockedQuestionIds */
export function getBlockedFromRecentRuns(
  history: DirectorHistory
): Set<string> {
  return getBlockedQuestionIds(history);
}
