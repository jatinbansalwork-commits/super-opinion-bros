import type { AnswerChoice, Question } from "@/lib/types";
import { didMatchMajority } from "@/lib/scoring";

export type PredictionTier = "exact" | "close" | "wrong";

export const SCORE_EXACT = 100;
export const SCORE_CLOSE = 50;
export const SCORE_WRONG = 0;

export interface PredictionOutcome {
  tier: PredictionTier;
  basePoints: number;
  comboMultiplier: number;
  pointsEarned: number;
  exactStreak: number;
}

export function getPlayerSidePercent(
  choice: AnswerChoice,
  percentA: number,
  percentB: number
): number {
  return choice === "A" ? percentA : percentB;
}

/** Close = picked losing side but within 12 points of the winner. */
export function classifyPrediction(
  choice: AnswerChoice,
  percentA: number,
  percentB: number,
  reverseInternet = false
): PredictionTier {
  let winner: AnswerChoice = percentA >= percentB ? "A" : "B";
  if (reverseInternet) {
    winner = winner === "A" ? "B" : "A";
  }

  if (choice === winner) return "exact";

  const playerPct = getPlayerSidePercent(choice, percentA, percentB);
  const winnerPct = Math.max(percentA, percentB);
  if (winnerPct - playerPct <= 12) return "close";

  return "wrong";
}

export function basePointsForTier(tier: PredictionTier): number {
  if (tier === "exact") return SCORE_EXACT;
  if (tier === "close") return SCORE_CLOSE;
  return SCORE_WRONG;
}

/** Combo: 1x, 1.25x, 1.5x, 1.75x, 2x cap on exact streaks. */
export function comboMultiplier(exactStreak: number): number {
  if (exactStreak <= 1) return 1;
  return Math.min(2, 1 + (exactStreak - 1) * 0.25);
}

export function scorePrediction(
  choice: AnswerChoice,
  question: Question,
  exactStreak: number,
  opts: {
    doubleNext?: boolean;
    scoreMultiplier?: number;
    reverseInternet?: boolean;
  } = {}
): PredictionOutcome {
  const tier = classifyPrediction(
    choice,
    question.result.percentA,
    question.result.percentB,
    opts.reverseInternet
  );

  const base = basePointsForTier(tier);
  const mult =
    tier === "exact" ? comboMultiplier(exactStreak) : 1;
  let points = Math.round(base * mult);

  if (opts.scoreMultiplier) {
    points = Math.round(points * opts.scoreMultiplier);
  }
  if (opts.doubleNext) {
    points *= 2;
  }

  const newStreak = tier === "exact" ? exactStreak + 1 : 0;

  return {
    tier,
    basePoints: base,
    comboMultiplier: mult,
    pointsEarned: points,
    exactStreak: newStreak,
  };
}

export function tierLabel(tier: PredictionTier): string {
  if (tier === "exact") return "EXACT MATCH";
  if (tier === "close") return "CLOSE";
  return "WRONG";
}

/** Legacy majority check (boss, stats). */
export function predictionMatched(
  choice: AnswerChoice,
  percentA: number,
  percentB: number,
  reverseInternet = false
): boolean {
  if (reverseInternet) {
    return !didMatchMajority(choice, percentA, percentB);
  }
  return didMatchMajority(choice, percentA, percentB);
}
