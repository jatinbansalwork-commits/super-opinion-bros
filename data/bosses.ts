import type { AnswerChoice } from "@/lib/types";

export interface BossRound {
  prompt: string;
  optionA: string;
  optionB: string;
  winner: AnswerChoice;
  percentA: number;
  percentB: number;
}

export interface BossDefinition {
  id: string;
  name: string;
  title: string;
  emoji: string;
  afterQuestion: number;
  rounds: BossRound[];
  failLine: string;
  winLine: string;
}

export const BOSSES: BossDefinition[] = [
  {
    id: "food-king",
    name: "THE FOOD KING",
    title: "BOSS BATTLE",
    emoji: "🍕",
    afterQuestion: 5,
    failLine: "The crowd chose... differently.",
    winLine: "You read the timeline!",
    rounds: [
      {
        prompt: "Pineapple on pizza?",
        optionA: "YES",
        optionB: "NO",
        winner: "B",
        percentA: 34,
        percentB: 66,
      },
      {
        prompt: "Cereal is soup?",
        optionA: "YES",
        optionB: "NO",
        winner: "B",
        percentA: 28,
        percentB: 72,
      },
      {
        prompt: "Hot dog = sandwich?",
        optionA: "YES",
        optionB: "NO",
        winner: "A",
        percentA: 58,
        percentB: 42,
      },
    ],
  },
  {
    id: "movie-dragon",
    name: "MOVIE DRAGON",
    title: "BOSS BATTLE",
    emoji: "🎬",
    afterQuestion: 10,
    failLine: "Rotten Tomatoes disagrees.",
    winLine: "Critics fear you!",
    rounds: [
      {
        prompt: "Die Hard = Christmas?",
        optionA: "YES",
        optionB: "NO",
        winner: "A",
        percentA: 67,
        percentB: 33,
      },
      {
        prompt: "Books beat movies?",
        optionA: "YES",
        optionB: "NO",
        winner: "A",
        percentA: 72,
        percentB: 28,
      },
      {
        prompt: "Skip all ads?",
        optionA: "ALWAYS",
        optionB: "NEVER",
        winner: "A",
        percentA: 94,
        percentB: 6,
      },
    ],
  },
  {
    id: "tech-goblin",
    name: "TECH GOBLIN",
    title: "BOSS BATTLE",
    emoji: "💻",
    afterQuestion: 15,
    failLine: "The forum mob wins.",
    winLine: "You outposted everyone!",
    rounds: [
      {
        prompt: "Tabs or spaces?",
        optionA: "TABS",
        optionB: "SPACES",
        winner: "B",
        percentA: 19,
        percentB: 81,
      },
      {
        prompt: "Dark mode always?",
        optionA: "YES",
        optionB: "NO",
        winner: "A",
        percentA: 68,
        percentB: 32,
      },
      {
        prompt: "AI art = real art?",
        optionA: "YES",
        optionB: "NO",
        winner: "B",
        percentA: 38,
        percentB: 62,
      },
    ],
  },
  {
    id: "chaos-queen",
    name: "CHAOS QUEEN",
    title: "BOSS BATTLE",
    emoji: "👑",
    afterQuestion: 20,
    failLine: "Chaos consumes you.",
    winLine: "Order restored... barely.",
    rounds: [
      {
        prompt: "GIF = jif?",
        optionA: "JIF",
        optionB: "GIF",
        winner: "B",
        percentA: 41,
        percentB: 59,
      },
      {
        prompt: "Dress: blue or gold?",
        optionA: "BLUE",
        optionB: "GOLD",
        winner: "A",
        percentA: 51,
        percentB: 49,
      },
      {
        prompt: "Internet good?",
        optionA: "YES",
        optionB: "NO",
        winner: "A",
        percentA: 61,
        percentB: 39,
      },
    ],
  },
];

export const FINAL_BOSS: BossDefinition = {
  id: "the-algorithm",
  name: "THE ALGORITHM",
  title: "FINAL BOSS",
  emoji: "🤖",
  afterQuestion: 20,
  failLine: "The feed has rejected you.",
  winLine: "You broke the timeline!",
  rounds: [
    {
      prompt: "Algorithm knows you?",
      optionA: "YES",
      optionB: "NO",
      winner: "A",
      percentA: 78,
      percentB: 22,
    },
    {
      prompt: "Touch grass?",
      optionA: "YES",
      optionB: "NO",
      winner: "B",
      percentA: 15,
      percentB: 85,
    },
    {
      prompt: "Delete social media?",
      optionA: "DO IT",
      optionB: "NEVER",
      winner: "B",
      percentA: 41,
      percentB: 59,
    },
  ],
};

export function getBossForCompletedCount(completed: number): BossDefinition | null {
  return BOSSES.find((b) => b.afterQuestion === completed) ?? null;
}
