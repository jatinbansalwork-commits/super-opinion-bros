import type { PlayerAnswer } from "@/lib/types";
import { RUN_LENGTH } from "@/data/questionPool";

export function getRunProgress(
  completedCount: number,
  total: number = RUN_LENGTH
): { filled: number; total: number; segments: number } {
  const segments = 8;
  const filled = Math.min(
    segments,
    Math.round((completedCount / total) * segments)
  );
  return { filled, total: segments, segments };
}

export function getInternetAgreement(playerAnswers: PlayerAnswer[]): number {
  if (playerAnswers.length === 0) return 0;
  const matches = playerAnswers.filter((a) => a.matchedMajority).length;
  return Math.round((matches / playerAnswers.length) * 100);
}

export function progressBar(filled: number, total: number): string {
  const full = "█".repeat(filled);
  const empty = "░".repeat(Math.max(0, total - filled));
  return full + empty;
}
