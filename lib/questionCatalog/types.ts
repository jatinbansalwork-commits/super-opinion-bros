import type { AnswerChoice } from "@/lib/types";

export type QuestionCategory =
  | "food"
  | "internet"
  | "pop-culture"
  | "culture"
  | "tech"
  | "chaos"
  | "random";

export type QuestionRarity = "common" | "uncommon" | "rare" | "cursed";

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
  /** Last 10 runs of question ids (newest first). */
  recentRuns: string[][];
  /** Last 50 questions seen this browser session. */
  sessionRecent: string[];
  questions: Record<string, CatalogQuestionStats>;
}
