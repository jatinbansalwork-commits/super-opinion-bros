import { ROUTE_DISPLAY_NAMES, ROUTE_LABELS } from "@/data/routes";
import { predictionMatched } from "@/lib/rewards";
import { rankDisplayLabel, endRankReward } from "@/lib/progression";
import {
  generateRunSummary,
  surpriseTierFromCount,
} from "@/lib/resultStats";
import { buildResultIdentity } from "@/lib/resultIdentity";
import { loadBestTitle } from "@/lib/playerRetention";
import { computeRouteScores, resolveSecretRoute } from "@/lib/routes";
import type {
  AnswerChoice,
  FinalResult,
  PlayerAnswer,
  Question,
  SecretRoute,
} from "./types";

export function didMatchMajority(
  choice: AnswerChoice,
  percentA: number,
  percentB: number
): boolean {
  const majorityIsA = percentA >= percentB;
  return majorityIsA ? choice === "A" : choice === "B";
}

export function buildPlayerAnswers(
  answers: Record<string, AnswerChoice>,
  runQuestions: Question[],
  reverseInternet = false
): PlayerAnswer[] {
  return runQuestions
    .filter((q) => answers[q.id])
    .map((q) => {
      const choice = answers[q.id]!;
      const matchedMajority = predictionMatched(
        choice,
        q.result.percentA,
        q.result.percentB,
        reverseInternet
      );
      return { questionId: q.id, choice, matchedMajority };
    });
}

export interface FinalCalcInput {
  playerAnswers: PlayerAnswer[];
  runQuestions: Question[];
  runCoins: number;
  level: number;
  route?: SecretRoute;
  surpriseCount?: number;
  bossWins?: number;
  bossAttempts?: number;
}

export function calculateFinalResult(input: FinalCalcInput): FinalResult {
  const {
    playerAnswers,
    runCoins,
    level,
    route: routeOverride,
    surpriseCount: trackedSurprises = 0,
    bossWins = 0,
    bossAttempts = 0,
  } = input;

  const total = playerAnswers.length || 1;
  const matches = playerAnswers.filter((a) => a.matchedMajority).length;
  const crowdReadPercent = Math.round((matches / total) * 100);
  const matchPercent = crowdReadPercent;
  const hotTakes = playerAnswers.filter((a) => !a.matchedMajority).length;
  const rank = rankDisplayLabel(matchPercent, playerAnswers.length);
  const rankReward = endRankReward(matchPercent);

  const surpriseCount = Math.max(trackedSurprises, 1);
  const surpriseTier = surpriseTierFromCount(surpriseCount);
  const summaryLine = generateRunSummary({
    crowdReadPercent,
    hotTakes,
    surpriseTier,
    totalQuestions: total,
  });

  const identity = buildResultIdentity({
    crowdReadPercent,
    hotTakes,
    surpriseTier,
    totalQuestions: total,
    bossWins,
    bossAttempts,
  });

  const routeScores = computeRouteScores(playerAnswers);
  const route = routeOverride ?? resolveSecretRoute(routeScores);
  const todayLabel = "TODAY YOU WERE…";
  const alignment =
    route === "default"
      ? "Neutral alignment"
      : ROUTE_DISPLAY_NAMES[route as keyof typeof ROUTE_DISPLAY_NAMES] ??
        ROUTE_LABELS[route];

  const shareLine = `SUPER OPINION BROS — ${identity.title} | Crowd ${crowdReadPercent}% | ${surpriseTier} surprises | ${runCoins} coins`;

  return {
    crowdReadPercent,
    hotTakes,
    surpriseTier,
    matchPercent,
    summaryLine,
    flavorLine: identity.flavorLine,
    bestTitle: loadBestTitle(),
    todayLabel,
    title: identity.title,
    badge: identity.badge,
    playstyle: identity.playstyle,
    alignment,
    variant: identity.variant,
    rank,
    rankFlavor: rankReward.flavor,
    level,
    coins: runCoins,
    runCoins,
    route,
    shareLine,
  };
}

export function getShareText(result: FinalResult): string {
  return result.shareLine;
}
