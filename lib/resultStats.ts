export type SurpriseTier = "LOW" | "MEDIUM" | "HIGH" | "MAXIMUM";

export function surpriseTierFromCount(count: number): SurpriseTier {
  if (count <= 3) return "LOW";
  if (count <= 8) return "MEDIUM";
  if (count <= 15) return "HIGH";
  return "MAXIMUM";
}

export function generateRunSummary(input: {
  crowdReadPercent: number;
  hotTakes: number;
  surpriseTier: SurpriseTier;
  totalQuestions: number;
}): string {
  const { crowdReadPercent, hotTakes, surpriseTier, totalQuestions } = input;
  const hotTakeThreshold = Math.max(3, Math.ceil(totalQuestions * 0.4));

  if (surpriseTier === "MAXIMUM") return "You survived the timeline.";
  if (surpriseTier === "HIGH") return "The internet refused to behave.";
  if (crowdReadPercent >= 75) return "You read the room.";
  if (hotTakes >= hotTakeThreshold) return "You trusted your weird side.";
  return "Not lucky. Just suspiciously online.";
}
