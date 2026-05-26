import { getWorldTheme } from "@/data/worlds";
import type { AnswerChoice, Question, QuestionResult } from "@/lib/types";

export interface PoolQuestion {
  id: string;
  category: string;
  text: string;
  emoji: string;
  options: { a: string; b: string };
  votes: {
    percentA: number;
    percentB: number;
    total: number;
    winner: AnswerChoice;
  };
  special?: boolean;
}

export const RUN_LENGTH = 20;
export const SPECIAL_INJECT_CHANCE = 0.6;

export const BASE_POOL: PoolQuestion[] = [
  { id: "q01", category: "food", text: "Is cereal a soup?", emoji: "🥣", options: { a: "YES", b: "NO" }, votes: { percentA: 28, percentB: 72, total: 8421034, winner: "B" } },
  { id: "q02", category: "tech", text: "Should phones have a headphone jack?", emoji: "🎧", options: { a: "YES", b: "NO" }, votes: { percentA: 71, percentB: 29, total: 11245091, winner: "A" } },
  { id: "q03", category: "food", text: "Should pineapple go on pizza?", emoji: "🍍", options: { a: "YES", b: "NO" }, votes: { percentA: 34, percentB: 66, total: 12345827, winner: "B" } },
  { id: "q04", category: "food", text: "Is a hot dog a sandwich?", emoji: "🌭", options: { a: "YES", b: "NO" }, votes: { percentA: 58, percentB: 42, total: 9876543, winner: "A" } },
  { id: "q05", category: "life", text: "Cats or dogs?", emoji: "🐾", options: { a: "CATS", b: "DOGS" }, votes: { percentA: 44, percentB: 56, total: 15678901, winner: "B" } },
  { id: "q06", category: "tech", text: "Tabs or spaces for code?", emoji: "⌨️", options: { a: "TABS", b: "SPACES" }, votes: { percentA: 19, percentB: 81, total: 7654321, winner: "B" } },
  { id: "q07", category: "life", text: "Toilet paper: over or under?", emoji: "🧻", options: { a: "OVER", b: "UNDER" }, votes: { percentA: 73, percentB: 27, total: 6543210, winner: "A" } },
  { id: "q08", category: "science", text: "Is water wet?", emoji: "💧", options: { a: "YES", b: "NO" }, votes: { percentA: 62, percentB: 38, total: 8901234, winner: "A" } },
  { id: "q09", category: "internet", text: "GIF pronounced jif or gif?", emoji: "🖼️", options: { a: "JIF", b: "GIF" }, votes: { percentA: 41, percentB: 59, total: 10123456, winner: "B" } },
  { id: "q10", category: "food", text: "Cake or pie for dessert?", emoji: "🎂", options: { a: "CAKE", b: "PIE" }, votes: { percentA: 54, percentB: 46, total: 5432109, winner: "A" } },
  { id: "q11", category: "culture", text: "Is Die Hard a Christmas movie?", emoji: "🎄", options: { a: "YES", b: "NO" }, votes: { percentA: 67, percentB: 33, total: 7890123, winner: "A" } },
  { id: "q12", category: "fashion", text: "Socks with sandals?", emoji: "🧦", options: { a: "FASHION", b: "CRIME" }, votes: { percentA: 12, percentB: 88, total: 4321098, winner: "B" } },
  { id: "q13", category: "science", text: "Is a tomato a fruit?", emoji: "🍅", options: { a: "YES", b: "NO" }, votes: { percentA: 89, percentB: 11, total: 6789012, winner: "A" } },
  { id: "q14", category: "space", text: "Aliens exist?", emoji: "👽", options: { a: "YES", b: "NO" }, votes: { percentA: 76, percentB: 24, total: 13456789, winner: "A" } },
  { id: "q15", category: "food", text: "Chocolate belongs in the fridge?", emoji: "🍫", options: { a: "YES", b: "NO" }, votes: { percentA: 31, percentB: 69, total: 5678901, winner: "B" } },
  { id: "q16", category: "internet", text: "Skip ads when you can?", emoji: "⏭️", options: { a: "ALWAYS", b: "NEVER" }, votes: { percentA: 94, percentB: 6, total: 14567890, winner: "A" } },
  { id: "q17", category: "sports", text: "Is esports real sports?", emoji: "🎮", options: { a: "YES", b: "NO" }, votes: { percentA: 52, percentB: 48, total: 8765432, winner: "A" } },
  { id: "q18", category: "art", text: "AI art is real art?", emoji: "🤖", options: { a: "YES", b: "NO" }, votes: { percentA: 38, percentB: 62, total: 11234567, winner: "B" } },
  { id: "q19", category: "meme", text: "Is the dress blue/black or white/gold?", emoji: "👗", options: { a: "BLUE", b: "GOLD" }, votes: { percentA: 51, percentB: 49, total: 18901234, winner: "A" } },
  { id: "q20", category: "internet", text: "Is the internet good for humanity?", emoji: "🌐", options: { a: "YES", b: "NO" }, votes: { percentA: 61, percentB: 39, total: 20123456, winner: "A" } },
  { id: "q21", category: "food", text: "Boneless wings are just nuggets?", emoji: "🍗", options: { a: "FACTS", b: "LIES" }, votes: { percentA: 63, percentB: 37, total: 7123456, winner: "A" } },
  { id: "q22", category: "life", text: "Is it okay to recline your plane seat?", emoji: "✈️", options: { a: "YES", b: "NO" }, votes: { percentA: 35, percentB: 65, total: 9234567, winner: "B" } },
  { id: "q23", category: "tech", text: "Dark mode is always better?", emoji: "🌙", options: { a: "YES", b: "NO" }, votes: { percentA: 68, percentB: 32, total: 11345678, winner: "A" } },
  { id: "q24", category: "culture", text: "Books better than their movies?", emoji: "📚", options: { a: "YES", b: "NO" }, votes: { percentA: 72, percentB: 28, total: 8345678, winner: "A" } },
  { id: "q25", category: "food", text: "Ketchup on eggs?", emoji: "🍳", options: { a: "YES", b: "NO" }, votes: { percentA: 22, percentB: 78, total: 6123456, winner: "B" } },
];

export const SPECIAL_QUESTIONS: PoolQuestion[] = [
  { id: "sp01", category: "wildcard", text: "Would aliens judge humanity?", emoji: "👽", options: { a: "YES", b: "NO" }, votes: { percentA: 88, percentB: 12, total: 9999999, winner: "A" }, special: true },
  { id: "sp02", category: "wildcard", text: "Delete social media forever?", emoji: "📵", options: { a: "DO IT", b: "NEVER" }, votes: { percentA: 41, percentB: 59, total: 8888888, winner: "B" }, special: true },
  { id: "sp03", category: "wildcard", text: "Live underwater?", emoji: "🐠", options: { a: "YES", b: "NO" }, votes: { percentA: 33, percentB: 67, total: 7777777, winner: "B" }, special: true },
  { id: "sp04", category: "wildcard", text: "Never watch movies again?", emoji: "🎬", options: { a: "YES", b: "NO" }, votes: { percentA: 8, percentB: 92, total: 6666666, winner: "B" }, special: true },
  { id: "sp05", category: "wildcard", text: "AI as your best friend?", emoji: "🤖", options: { a: "YES", b: "NO" }, votes: { percentA: 47, percentB: 53, total: 5555555, winner: "B" }, special: true },
  { id: "sp06", category: "wildcard", text: "Touch grass forever?", emoji: "🌿", options: { a: "YES", b: "NO" }, votes: { percentA: 15, percentB: 85, total: 4444444, winner: "B" }, special: true },
];

const POOL_BY_ID = new Map(
  [...BASE_POOL, ...SPECIAL_QUESTIONS].map((q) => [q.id, q])
);

export function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function poolToQuestion(pq: PoolQuestion, worldIndex: number): Question {
  const theme = getWorldTheme(worldIndex);
  const result: QuestionResult = {
    winner: pq.votes.winner,
    percentA: pq.votes.percentA,
    percentB: pq.votes.percentB,
    totalVotes: pq.votes.total,
  };
  return {
    id: pq.id,
    world: worldIndex + 1,
    worldName: theme.name,
    kingdom: pq.special ? "WILD CARD" : theme.kingdom,
    title: pq.text,
    emoji: pq.emoji,
    optionA: pq.options.a,
    optionB: pq.options.b,
    result,
  };
}

function pickSpecialCount(): number {
  if (Math.random() > SPECIAL_INJECT_CHANCE) return 0;
  return 1 + Math.floor(Math.random() * 3);
}

function injectAtRandomPositions(
  base: PoolQuestion[],
  specials: PoolQuestion[],
  runLength: number
): PoolQuestion[] {
  const result = [...base];
  for (const sp of specials) {
    const idx = Math.floor(Math.random() * (result.length + 1));
    result.splice(idx, 0, sp);
  }
  return result.slice(0, runLength);
}

export function buildRunQuestions(
  usedQuestionIds: string[],
  runLength: number = RUN_LENGTH
): {
  questions: Question[];
  runQuestionIds: string[];
  nextUsedIds: string[];
} {
  const count = Math.min(Math.max(runLength, 1), RUN_LENGTH);
  let used = [...usedQuestionIds];
  let available = BASE_POOL.filter((q) => !used.includes(q.id));

  if (available.length < count) {
    used = [];
    available = [...BASE_POOL];
  }

  const shuffled = shuffle(available);
  let picked = shuffled.slice(0, count);

  const specialCount = count >= 10 ? pickSpecialCount() : 0;
  if (specialCount > 0) {
    const specials = shuffle(SPECIAL_QUESTIONS).slice(0, specialCount);
    picked = injectAtRandomPositions(picked, specials, count);
  }

  const questions = picked.map((pq, i) => poolToQuestion(pq, i));
  const runQuestionIds = picked.map((q) => q.id);
  const nextUsedIds = [...new Set([...used, ...runQuestionIds])];

  return { questions, runQuestionIds, nextUsedIds };
}

export function questionsFromIds(ids: string[]): Question[] {
  return ids
    .map((id, i) => {
      const pq = POOL_BY_ID.get(id);
      return pq ? poolToQuestion(pq, i) : null;
    })
    .filter((q): q is Question => q !== null);
}

export function getPoolQuestion(id: string): PoolQuestion | undefined {
  return POOL_BY_ID.get(id);
}
