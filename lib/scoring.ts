import { getPoolQuestion } from "@/data/questionPool";
import { ROUTE_DISPLAY_NAMES, ROUTE_LABELS } from "@/data/routes";
import { predictionMatched } from "@/lib/chaosScoring";
import { endRankReward, rankDisplayLabel } from "@/lib/progression";
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
  coins: number;
  runCoins: number;
  runScore: number;
  level: number;
  route?: SecretRoute;
}

export function calculateFinalResult(input: FinalCalcInput): FinalResult {
  const {
    playerAnswers,
    runQuestions,
    coins,
    runCoins,
    runScore,
    level,
    route: routeOverride,
  } = input;

  const total = playerAnswers.length || 1;
  const matches = playerAnswers.filter((a) => a.matchedMajority).length;
  const matchPercent = Math.round((matches / total) * 100);
  const rank = rankDisplayLabel(matchPercent, playerAnswers.length);
  const rankReward = endRankReward(matchPercent);

  let rareChoices = 0;
  let chaosAccumulator = 0;
  let specialAnswered = 0;

  for (const answer of playerAnswers) {
    const question =
      runQuestions.find((q) => q.id === answer.questionId) ??
      (() => {
        const pq = getPoolQuestion(answer.questionId);
        if (!pq) return null;
        return {
          result: {
            percentA: pq.votes.percentA,
            percentB: pq.votes.percentB,
          },
        };
      })();

    if (!question) continue;

    const playerPercent =
      answer.choice === "A"
        ? question.result.percentA
        : question.result.percentB;

    if (playerPercent < 40) rareChoices += 1;
    chaosAccumulator += Math.abs(50 - playerPercent);

    const pq = getPoolQuestion(answer.questionId);
    if (pq?.special) specialAnswered += 1;
  }

  const chaosScore = Math.round(chaosAccumulator / total);
  const routeScores = computeRouteScores(playerAnswers);
  const route = routeOverride ?? resolveSecretRoute(routeScores);
  const todayLabel = "Today you got";

  let title = "THE INTERNET NPC";
  let badge = "🙂 AVERAGE LEGEND";
  let description = "You lurk. You vote. You vanish.";
  let playstyle = "Balanced predictor";
  const alignment =
    route === "default"
      ? "Neutral alignment"
      : ROUTE_DISPLAY_NAMES[route as keyof typeof ROUTE_DISPLAY_NAMES] ??
        ROUTE_LABELS[route];
  let variant: FinalResult["variant"] = "npc";

  if (matchPercent >= 82) {
    title = "THE INTERNET KING";
    badge = "👑 CROWN VERIFIED";
    description = "The timeline bends to your polls.";
    playstyle = "Crowd oracle";
    variant = "king";
  } else if (matchPercent >= 65 && matchPercent < 82) {
    title = "OPINION KNIGHT";
    badge = "⚔️ HONORABLE VOTER";
    description = "You defend the majority with honor.";
    playstyle = "Knight of consensus";
    variant = "knight";
  } else if (matchPercent <= 25) {
    title = "CHAOS GREMLIN";
    badge = "🔥 AGENT OF CHAOS";
    description = "You feed on ratio energy.";
    playstyle = "Chaos agent";
    variant = "goblin";
  } else if (rareChoices >= 6 || specialAnswered >= 2) {
    title = "THE HOT TAKE MACHINE";
    badge = "🗡️ SPICY VOTER";
    description = "Comments fear your notifications.";
    playstyle = "Contrarian engine";
    variant = "rebel";
  } else if (route === "glitch") {
    title = "THE TIMELINE BREAKER";
    badge = "⭐ GLITCH ENDING";
    description = "You exist between timelines.";
    playstyle = "Glitch walker";
    variant = "timeline";
  } else if (matchPercent >= 70 && route === "crowd") {
    title = "ALGORITHM PROPHET";
    badge = "🤖 FEED FRIEND";
    description = "The algorithm whispers: 'more of this.'";
    playstyle = "Feed friendly";
    variant = "prophet";
  } else if (route === "chaos") {
    title = "CHAOS GREMLIN";
    badge = "👹 CHAOS ROAD";
    description = "You took the spicy path on purpose.";
    playstyle = "Chaos pilgrim";
    variant = "chaos";
  }

  const shareLine = `SUPER OPINION BROS — ${title} | ${matchPercent}% | ${rank} | Score ${runScore}`;

  return {
    matchPercent,
    rareChoices,
    chaosScore,
    todayLabel,
    title,
    badge,
    description,
    playstyle,
    alignment,
    variant,
    rank,
    rankFlavor: rankReward.flavor,
    level,
    coins,
    runCoins,
    runScore,
    route,
    shareLine,
  };
}

export function getShareText(result: FinalResult): string {
  return result.shareLine;
}
