import { QUESTION_CATALOG, CATALOG_SIZE } from "@/data/questionCatalog";
import type { CatalogQuestion, QuestionCategory } from "./types";

export type { CatalogQuestion, QuestionCategory, QuestionRarity } from "./types";
export { CATALOG_SIZE };

const BY_ID = new Map(QUESTION_CATALOG.map((q) => [q.id, q]));

export function getCatalogQuestion(id: string): CatalogQuestion | undefined {
  return BY_ID.get(id);
}

export function getAllCatalogQuestions(): CatalogQuestion[] {
  return QUESTION_CATALOG;
}

export function filterCatalogByCategory(
  category: QuestionCategory
): CatalogQuestion[] {
  return QUESTION_CATALOG.filter((q) => q.category === category);
}

export function catalogToPoolShape(q: CatalogQuestion) {
  return {
    id: q.id,
    category: q.category,
    text: q.question,
    emoji: q.emoji,
    options: { a: q.optionA, b: q.optionB },
    votes: {
      percentA: q.votes.percentA,
      percentB: q.votes.percentB,
      total: q.votes.total,
      winner: q.votes.winner,
    },
    special: q.special,
  };
}
