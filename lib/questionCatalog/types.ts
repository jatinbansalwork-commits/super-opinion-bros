import type { AnswerChoice } from "@/lib/types";

export type QuestionCategory =
  | "food"
  | "internet"
  | "culture"
  | "tech"
  | "chaos";

export type QuestionRarity = "common" | "uncommon" | "rare";

export interface CatalogQuestion {
  id: string;
  question: string;
  category: QuestionCategory;
  rarity: QuestionRarity;
  weight: number;
  emoji: string;
  optionA: string;
  optionB: string;
  votes: {
    percentA: number;
    percentB: number;
    total: number;
    winner: AnswerChoice;
  };
  special?: boolean;
}

export interface CatalogQuestionStats {
  shown: number;
  lastSeenRun: number;
}

export interface DirectorHistory {
  version: number;
  runCounter: number;
  /** Last 3 runs of question ids (newest first). */
  recentRuns: string[][];
  questions: Record<string, CatalogQuestionStats>;
}
