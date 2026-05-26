import type { AnswerChoice, Question } from "@/lib/types";
import { didMatchMajority } from "@/lib/scoring";
import type { PredictionTier } from "@/lib/types";

export const COIN_EXACT = 50;
export const COIN_CLOSE = 25;
export const COIN_WRONG = 0;
export const COIN_BOSS = 100;
export const COIN_RARE = 100;

export interface CoinRewardOutcome {
  tier: PredictionTier;
  coinsEarned: number;
}

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
  const playerPct = choice === "A" ? percentA : percentB;
  const winnerPct = Math.max(percentA, percentB);
  if (winnerPct - playerPct <= 12) return "close";
  return "wrong";
}

export function coinsForTier(tier: PredictionTier): number {
  if (tier === "exact") return COIN_EXACT;
  if (tier === "close") return COIN_CLOSE;
  return COIN_WRONG;
}

export function computeCoinReward(
  choice: AnswerChoice,
  question: Question,
  opts: {
    doubleNext?: boolean;
    doubleOnMatch?: boolean;
    reverseInternet?: boolean;
    majorityBonus?: boolean;
    unstableWinner?: AnswerChoice;
    randomBonus?: number;
    isRare?: boolean;
  } = {}
): CoinRewardOutcome {
  let tier = classifyPrediction(
    choice,
    question.result.percentA,
    question.result.percentB,
    opts.reverseInternet
  );

  if (opts.unstableWinner && choice === opts.unstableWinner) {
    tier = "exact";
  }

  if (opts.majorityBonus) {
    const majority: AnswerChoice =
      question.result.percentA >= question.result.percentB ? "A" : "B";
    if (choice === majority) tier = "exact";
  }

  let coinsEarned = question.isRare || opts.isRare
    ? COIN_RARE
    : coinsForTier(tier);

  if (opts.doubleNext && coinsEarned > 0) {
    coinsEarned *= 2;
  }
  if (opts.doubleOnMatch && tier === "exact" && coinsEarned > 0) {
    coinsEarned *= 2;
  }
  if (opts.randomBonus != null && opts.randomBonus > 0) {
    coinsEarned += opts.randomBonus;
  }
  return { tier, coinsEarned };
}

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

/** One coin = one level step every 50 coins earned this run. */
export function levelFromCoins(coins: number): number {
  return Math.max(1, Math.floor(coins / 50) + 1);
}

const INTERNET_TITLES = [
  "Scroll Gremlin",
  "Comment Reader",
  "Reply Guy",
  "Meme Apprentice",
  "Trend Spotter",
  "Hot Take Knight",
  "Ratio Survivor",
  "Feed Whisperer",
  "Timeline Walker",
  "Internet Oracle",
];

export function internetTitleForLevel(level: number): string {
  const idx = Math.min(Math.max(level - 1, 0), INTERNET_TITLES.length - 1);
  return INTERNET_TITLES[idx]!;
}
