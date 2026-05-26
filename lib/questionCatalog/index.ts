import {
  QUESTION_CATALOG,
  CATALOG_SIZE,
  getCatalogByCategory,
  getCatalogQuestion,
  getAllCatalogQuestions,
} from "@/data/questionCatalog";
import type { CatalogQuestion, QuestionCategory } from "./types";

export type { CatalogQuestion, QuestionCategory, QuestionRarity } from "./types";
export { CATALOG_SIZE, getAllCatalogQuestions, getCatalogQuestion };

const BY_ID = new Map<string, CatalogQuestion>();

export function getCatalogQuestionCached(id: string): CatalogQuestion | undefined {
  if (!BY_ID.size) {
    for (const q of getAllCatalogQuestions()) {
      BY_ID.set(q.id, q);
    }
  }
  return BY_ID.get(id) ?? getCatalogQuestion(id);
}

export function filterCatalogByCategory(
  category: QuestionCategory
): CatalogQuestion[] {
  const cat = category === "culture" ? "pop-culture" : category;
  return getCatalogByCategory(cat);
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

export { QUESTION_CATALOG };
