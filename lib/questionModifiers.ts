import type { QuestionModifier } from "@/lib/types";

export const QUESTION_MODIFIERS: {
  id: QuestionModifier;
  label: string;
  emoji: string;
}[] = [
  { id: "crowd-flip", label: "CROWD FLIP", emoji: "🔄" },
  { id: "hot-take", label: "HOT TAKE", emoji: "🔥" },
  { id: "votes-hidden", label: "VOTES HIDDEN", emoji: "🙈" },
  { id: "double-reward", label: "DOUBLE REWARD", emoji: "💰" },
];

const MODIFIER_CHANCE = 0.14;

export function rollQuestionModifier(
  rng: () => number
): QuestionModifier | null {
  if (rng() > MODIFIER_CHANCE) return null;
  const pool = QUESTION_MODIFIERS;
  return pool[Math.floor(rng() * pool.length)]!.id;
}

export function modifierLabel(id: QuestionModifier): string {
  return QUESTION_MODIFIERS.find((m) => m.id === id)?.label ?? id;
}
