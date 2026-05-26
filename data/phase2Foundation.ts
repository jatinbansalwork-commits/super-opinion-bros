/**
 * Phase 2 roadmap — not active in v1.3 gameplay.
 * Checkpoints every 5 questions are the hook for future boss battles (Option A)
 * and career progression (Option F).
 */
export const PHASE2_BOSSES = [
  { afterQuestion: 5, id: "food-king", name: "Food King", emoji: "🍔" },
  { afterQuestion: 10, id: "tech-goblin", name: "Tech Goblin", emoji: "💻" },
  { afterQuestion: 15, id: "movie-dragon", name: "Movie Dragon", emoji: "🎬" },
  { afterQuestion: 20, id: "ai-wizard", name: "AI Wizard", emoji: "🤖" },
] as const;

export const PHASE2_ITEMS = [
  "fifty-fifty",
  "skip",
  "audience-poll",
  "double-score",
] as const;
