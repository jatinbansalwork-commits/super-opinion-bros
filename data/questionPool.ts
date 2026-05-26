import {
  catalogToPoolShape,
  getAllCatalogQuestions,
  getCatalogQuestion,
} from "@/lib/questionCatalog";
import {
  buildRunWithDirector,
  createRunSeed,
} from "@/lib/questionDirector";
import type { Question, QuestionResult } from "@/lib/types";
import { getWorldTheme } from "@/data/worlds";

export type PoolQuestion = ReturnType<typeof catalogToPoolShape>;

export const RUN_LENGTH = 20;
export const SPECIAL_INJECT_CHANCE = 0.6;

export const BASE_POOL: PoolQuestion[] = getAllCatalogQuestions().map(
  catalogToPoolShape
);

export const SPECIAL_QUESTIONS: PoolQuestion[] = getAllCatalogQuestions()
  .filter((q) => q.category === "chaos" && q.rarity === "rare")
  .slice(0, 6)
  .map(catalogToPoolShape);

export function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
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

export function buildRunQuestions(
  usedQuestionIds: string[],
  runLength: number = RUN_LENGTH
): {
  questions: Question[];
  runQuestionIds: string[];
  nextUsedIds: string[];
} {
  const { questions, runQuestionIds } = buildRunWithDirector(
    runLength,
    createRunSeed()
  );
  return {
    questions,
    runQuestionIds,
    nextUsedIds: [...usedQuestionIds, ...runQuestionIds],
  };
}

export function questionsFromIds(ids: string[]): Question[] {
  return ids
    .map((id, i) => {
      const cq = getCatalogQuestion(id);
      if (!cq) return null;
      return poolToQuestion(catalogToPoolShape(cq), i);
    })
    .filter((q): q is Question => q !== null);
}

export function getPoolQuestion(id: string): PoolQuestion | undefined {
  const cq = getCatalogQuestion(id);
  return cq ? catalogToPoolShape(cq) : undefined;
}
