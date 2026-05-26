const GENERIC_RUMORS = [
  "🎲 Nobody knows the internet.",
  "🍔 Predict the crowd. Survive the kingdom.",
  "🥣 One bad take changes everything.",
  "🌭 Every opinion has consequences.",
];

export const KINGDOM_RUMORS: Record<number, string[]> = {
  1: [
    "🍕 The internet is hungry today.",
    "🍔 Nobody agrees. Everyone votes.",
    "🥣 One bad take changes everything.",
    "🌭 Predict the crowd. Escape judgment.",
    "🧀 The algorithm smells confidence.",
  ],
  2: [
    "🎬 The crowd has strong opinions about everything.",
    "🍿 Spoilers are a social crime.",
    "🎭 Main character energy detected.",
    "📺 The timeline is watching.",
    "🎥 Blockbuster or flop — the internet decides.",
  ],
  3: [
    "💻 Silicon Valley is judging you.",
    "🤖 The algorithm knows your type.",
    "📱 Hot take loading…",
    "🔌 Nobody reads the manual.",
    "🧠 Trending or dead on arrival?",
  ],
  4: [
    "👑 Chaos reigns in this spire.",
    "🔥 Terminally online energy only.",
    "💀 The ratio hunters are awake.",
    "⚡ Expect the unexpected.",
    "🌀 The internet has no mercy here.",
  ],
};

export function pickKingdomRumor(worldId: number): string {
  const pool = KINGDOM_RUMORS[worldId] ?? GENERIC_RUMORS;
  return pool[Math.floor(Math.random() * pool.length)]!;
}
