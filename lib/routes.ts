import type { PlayerAnswer, SecretRoute } from "@/lib/types";

export interface RouteScores {
  majorityScore: number;
  chaosScore: number;
  contrarianScore: number;
}

export function computeRouteScores(answers: PlayerAnswer[]): RouteScores {
  if (answers.length === 0) {
    return { majorityScore: 50, chaosScore: 50, contrarianScore: 50 };
  }

  let matches = 0;
  let chaosAccumulator = 0;

  for (const a of answers) {
    if (a.matchedMajority) matches += 1;
    chaosAccumulator += a.matchedMajority ? 0 : 1;
  }

  const majorityScore = Math.round((matches / answers.length) * 100);
  const chaosScore = Math.round((chaosAccumulator / answers.length) * 100);
  const contrarianScore = 100 - majorityScore;

  return { majorityScore, chaosScore, contrarianScore };
}

export function resolveSecretRoute(scores: RouteScores): SecretRoute {
  if (scores.majorityScore > 80) return "crowd";
  if (scores.majorityScore < 30) return "chaos";
  if (
    scores.contrarianScore > 55 &&
    scores.majorityScore >= 30 &&
    scores.majorityScore <= 70
  ) {
    return "glitch";
  }
  return "default";
}

/** After stage 3 (3 answers), unlock map branch. */
export function resolveMapBranch(
  answers: PlayerAnswer[]
): "normal" | "chaos" | null {
  if (answers.length < 3) return null;
  const scores = computeRouteScores(answers.slice(0, 3));
  if (scores.majorityScore > 70) return "normal";
  if (scores.majorityScore < 30) return "chaos";
  return null;
}

export function branchToRoute(
  branch: "normal" | "chaos" | null
): SecretRoute {
  if (branch === "normal") return "crowd";
  if (branch === "chaos") return "chaos";
  return "default";
}
