/**
 * Generates data/questionCatalog.ts with exactly 300 questions.
 * Run: node scripts/generate-question-catalog.mjs
 */
import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const CATEGORIES = ["food", "internet", "culture", "tech", "chaos"];

const TEMPLATES = {
  food: [
    ["Is cereal a soup?", "🥣", "YES", "NO", 28, 72],
    ["Should pineapple go on pizza?", "🍍", "YES", "NO", 34, 66],
    ["Is a hot dog a sandwich?", "🌭", "YES", "NO", 58, 42],
    ["Boneless wings are just nuggets?", "🍗", "FACTS", "LIES", 63, 37],
    ["Ketchup on eggs?", "🍳", "YES", "NO", 22, 78],
    ["Chocolate belongs in the fridge?", "🍫", "YES", "NO", 31, 69],
    ["Cake or pie for dessert?", "🎂", "CAKE", "PIE", 54, 46],
    ["Is a taco a sandwich?", "🌮", "YES", "NO", 41, 59],
    ["Milk before cereal?", "🥛", "YES", "NO", 18, 82],
    ["Are boneless wings real wings?", "🍗", "YES", "NO", 27, 73],
    ["Is water soup?", "💧", "YES", "NO", 12, 88],
    ["Pineapple on pizza is elite?", "🍕", "YES", "NO", 36, 64],
    ["Is a burrito a wrap?", "🌯", "YES", "NO", 48, 52],
    ["Ice cream on warm pie?", "🥧", "YES", "NO", 71, 29],
    ["Is ketchup a smoothie?", "🍅", "YES", "NO", 9, 91],
    ["Are pancakes breakfast only?", "🥞", "YES", "NO", 44, 56],
    ["Is cereal better without milk?", "🥣", "YES", "NO", 33, 67],
    ["Should pizza be folded?", "🍕", "YES", "NO", 52, 48],
    ["Is a calzone a sandwich?", "🥟", "YES", "NO", 39, 61],
    ["Ranch on everything?", "🥗", "YES", "NO", 46, 54],
    ["Is butter a sauce?", "🧈", "YES", "NO", 24, 76],
    ["Are fries a salad topping?", "🍟", "YES", "NO", 19, 81],
    ["Is instant ramen gourmet?", "🍜", "YES", "NO", 38, 62],
    ["Must pizza have cheese?", "🧀", "YES", "NO", 67, 33],
    ["Is a smoothie a meal?", "🥤", "YES", "NO", 55, 45],
    ["Are chicken nuggets fingers food?", "🍗", "YES", "NO", 72, 28],
    ["Is leftover pizza breakfast?", "🍕", "YES", "NO", 61, 39],
    ["Should burgers be well done?", "🍔", "YES", "NO", 29, 71],
    ["Is a quesadilla a grilled cheese?", "🧀", "YES", "NO", 43, 57],
    ["Are pickles on burgers essential?", "🥒", "YES", "NO", 58, 42],
  ],
  internet: [
    ["GIF pronounced jif or gif?", "🖼️", "JIF", "GIF", 41, 59],
    ["Skip ads when you can?", "⏭️", "ALWAYS", "NEVER", 94, 6],
    ["Is the internet good for humanity?", "🌐", "YES", "NO", 61, 39],
    ["Reply all is ever okay?", "📧", "YES", "NO", 14, 86],
    ["Read the comments section?", "💬", "YES", "NO", 37, 63],
    ["Is doomscrolling self-care?", "📱", "YES", "NO", 11, 89],
    ["Delete your main account yearly?", "📵", "YES", "NO", 23, 77],
    ["Are memes modern folklore?", "😂", "YES", "NO", 69, 31],
    ["Is lurking valid participation?", "👀", "YES", "NO", 74, 26],
    ["Post through it?", "📲", "YES", "NO", 31, 69],
    ["Is ratioing a sport?", "⚖️", "YES", "NO", 56, 44],
    ["Trust Wikipedia?", "📚", "YES", "NO", 78, 22],
    ["Are influencers journalists?", "📰", "YES", "NO", 26, 74],
    ["Is the algorithm your friend?", "🤖", "YES", "NO", 34, 66],
    ["Read terms of service?", "📜", "YES", "NO", 8, 92],
    ["Is subtweeting art?", "🐦", "YES", "NO", 42, 58],
    ["Are reaction GIFs language?", "💬", "YES", "NO", 81, 19],
    ["Is cancel culture new?", "❌", "YES", "NO", 47, 53],
    ["Trust anonymous tips?", "🕵️", "YES", "NO", 21, 79],
    ["Is the feed your diary?", "📔", "YES", "NO", 33, 67],
    ["Are likes currency?", "❤️", "YES", "NO", 64, 36],
    ["Is posting cringe brave?", "😬", "YES", "NO", 52, 48],
    ["Block without explanation?", "🚫", "YES", "NO", 59, 41],
    ["Is the group chat sacred?", "💬", "YES", "NO", 76, 24],
    ["Trust viral screenshots?", "📸", "YES", "NO", 18, 82],
    ["Are polls scientific?", "📊", "YES", "NO", 15, 85],
    ["Is ghosting acceptable?", "👻", "YES", "NO", 38, 62],
    ["Read YouTube comments?", "▶️", "YES", "NO", 27, 73],
    ["Is the timeline real life?", "⏱️", "YES", "NO", 29, 71],
    ["Are hot takes content?", "🔥", "YES", "NO", 66, 34],
  ],
  culture: [
    ["Is Die Hard a Christmas movie?", "🎄", "YES", "NO", 67, 33],
    ["Books better than movies?", "📚", "YES", "NO", 72, 28],
    ["Cats or dogs?", "🐾", "CATS", "DOGS", 44, 56],
    ["Toilet paper: over or under?", "🧻", "OVER", "UNDER", 73, 27],
    ["Socks with sandals?", "🧦", "FASHION", "CRIME", 12, 88],
    ["Is it okay to recline your plane seat?", "✈️", "YES", "NO", 35, 65],
    ["Are spoilers ever okay?", "🎬", "YES", "NO", 22, 78],
    ["Is clapping when the plane lands cringe?", "👏", "YES", "NO", 48, 52],
    ["Stand for the movie trailer?", "🎥", "YES", "NO", 17, 83],
    ["Is karaoke courage?", "🎤", "YES", "NO", 63, 37],
    ["Are horoscopes harmless fun?", "♈", "YES", "NO", 54, 46],
    ["Is pineapple on pizza culture war?", "🍍", "YES", "NO", 71, 29],
    ["Wear headphones at parties?", "🎧", "YES", "NO", 41, 59],
    ["Is small talk necessary?", "💬", "YES", "NO", 57, 43],
    ["Are wedding speeches too long?", "💒", "YES", "NO", 68, 32],
    ["Is tipping culture broken?", "💵", "YES", "NO", 62, 38],
    ["Clap on the first day of class?", "📚", "YES", "NO", 14, 86],
    ["Is fashion just costumes?", "👗", "YES", "NO", 39, 61],
    ["Are spoilers a moral crime?", "🚫", "YES", "NO", 45, 55],
    ["Is nostalgia a personality?", "📼", "YES", "NO", 51, 49],
    ["Wear PJs in public?", "🛏️", "YES", "NO", 28, 72],
    ["Is brunch just breakfast?", "🥂", "YES", "NO", 33, 67],
    ["Are group costumes mandatory?", "🎃", "YES", "NO", 36, 64],
    ["Is applause after landing rude?", "✈️", "YES", "NO", 44, 56],
    ["Trust movie ratings?", "⭐", "YES", "NO", 49, 51],
    ["Is reality TV real?", "📺", "YES", "NO", 19, 81],
    ["Are vinyl records worth it?", "💿", "YES", "NO", 58, 42],
    ["Is fan fiction valid art?", "✍️", "YES", "NO", 61, 39],
    ["Wear sunglasses indoors?", "🕶️", "YES", "NO", 23, 77],
    ["Is the Oscars still relevant?", "🏆", "YES", "NO", 32, 68],
  ],
  tech: [
    ["Should phones have a headphone jack?", "🎧", "YES", "NO", 71, 29],
    ["Tabs or spaces for code?", "⌨️", "TABS", "SPACES", 19, 81],
    ["Dark mode is always better?", "🌙", "YES", "NO", 68, 32],
    ["Is AI art real art?", "🤖", "YES", "NO", 38, 62],
    ["Are esports real sports?", "🎮", "YES", "NO", 52, 48],
    ["Is the cloud just someone else's PC?", "☁️", "YES", "NO", 74, 26],
    ["Should you read privacy policies?", "🔒", "YES", "NO", 12, 88],
    ["Is Bluetooth witchcraft?", "📶", "YES", "NO", 46, 54],
    ["Are passwords obsolete?", "🔑", "YES", "NO", 59, 41],
    ["Is two-factor auth annoying?", "📱", "YES", "NO", 34, 66],
    ["Trust autocorrect?", "✏️", "YES", "NO", 41, 59],
    ["Is wireless charging worth it?", "🔋", "YES", "NO", 55, 45],
    ["Are smart homes creepy?", "🏠", "YES", "NO", 48, 52],
    ["Is coding math?", "➗", "YES", "NO", 27, 73],
    ["Should robots have rights?", "🤖", "YES", "NO", 43, 57],
    ["Is the metaverse dead?", "🥽", "YES", "NO", 67, 33],
    ["Trust app store reviews?", "⭐", "YES", "NO", 31, 69],
    ["Are NFTs still a thing?", "🖼️", "YES", "NO", 14, 86],
    ["Is Linux for everyone?", "🐧", "YES", "NO", 36, 64],
    ["Should phones last 5 years?", "📱", "YES", "NO", 72, 28],
    ["Is typing speed a skill?", "⌨️", "YES", "NO", 61, 39],
    ["Are mechanical keyboards worth it?", "⌨️", "YES", "NO", 58, 42],
    ["Is incognito mode private?", "🕵️", "YES", "NO", 22, 78],
    ["Trust password managers?", "🔐", "YES", "NO", 76, 24],
    ["Is USB-C universal yet?", "🔌", "YES", "NO", 54, 46],
    ["Are foldable phones the future?", "📱", "YES", "NO", 39, 61],
    ["Is ChatGPT homework cheating?", "📝", "YES", "NO", 51, 49],
    ["Should you unplug at night?", "🔌", "YES", "NO", 44, 56],
    ["Is open source safer?", "📂", "YES", "NO", 63, 37],
    ["Are smartwatches necessary?", "⌚", "YES", "NO", 37, 63],
  ],
  chaos: [
    ["Is water wet?", "💧", "YES", "NO", 62, 38],
    ["Is a tomato a fruit?", "🍅", "YES", "NO", 89, 11],
    ["Aliens exist?", "👽", "YES", "NO", 76, 24],
    ["Is the dress blue or gold?", "👗", "BLUE", "GOLD", 51, 49],
    ["Would aliens judge humanity?", "👽", "YES", "NO", 88, 12],
    ["Delete social media forever?", "📵", "DO IT", "NEVER", 41, 59],
    ["Live underwater?", "🐠", "YES", "NO", 33, 67],
    ["AI as your best friend?", "🤖", "YES", "NO", 47, 53],
    ["Is cereal a beverage?", "🥣", "YES", "NO", 16, 84],
    ["Are birds government drones?", "🐦", "YES", "NO", 21, 79],
    ["Is the moon fake?", "🌙", "YES", "NO", 8, 92],
    ["Can you hear colors?", "🌈", "YES", "NO", 13, 87],
    ["Is time a social construct?", "⏰", "YES", "NO", 58, 42],
    ["Are we in a simulation?", "🕹️", "YES", "NO", 54, 46],
    ["Is cereal soup at night?", "🌙", "YES", "NO", 31, 69],
    ["Would you fight a horse-sized duck?", "🦆", "YES", "NO", 44, 56],
    ["Is a hot dog a taco?", "🌭", "YES", "NO", 37, 63],
    ["Are hot dogs sandwiches?", "🌭", "YES", "NO", 52, 48],
    ["Is pizza a vegetable?", "🍕", "YES", "NO", 19, 81],
    ["Can fish see air?", "🐟", "YES", "NO", 24, 76],
    ["Is the Earth flat?", "🌍", "YES", "NO", 6, 94],
    ["Would you eat bugs for $1M?", "🐛", "YES", "NO", 61, 39],
    ["Is sleep optional?", "😴", "YES", "NO", 11, 89],
    ["Are ghosts real?", "👻", "YES", "NO", 42, 58],
    ["Is cereal a salad?", "🥗", "YES", "NO", 26, 74],
    ["Would you swap brains with your pet?", "🐕", "YES", "NO", 33, 67],
    ["Is a straw one hole or two?", "🥤", "ONE", "TWO", 48, 52],
    ["Are we all NPCs?", "🎮", "YES", "NO", 39, 61],
    ["Is the internet conscious?", "🧠", "YES", "NO", 28, 72],
    ["Would you time travel for memes?", "⏳", "YES", "NO", 71, 29],
  ],
};

function rarityForIndex(i) {
  if (i % 7 === 0) return "rare";
  if (i % 3 === 0) return "uncommon";
  return "common";
}

function weightForRarity(r) {
  if (r === "rare") return 0.6;
  if (r === "uncommon") return 0.85;
  return 1;
}

function buildCategory(cat, startId) {
  const rows = TEMPLATES[cat];
  const out = [];
  for (let i = 0; i < 60; i++) {
    const t = rows[i % rows.length];
    const [question, emoji, a, b, pctA, pctB] = t;
    const variant = i >= rows.length ? ` (${Math.floor(i / rows.length) + 1})` : "";
    const rarity = rarityForIndex(i);
    const winner = pctA >= pctB ? "A" : "B";
    const total = 3_000_000 + ((startId + i) * 137_891) % 15_000_000;
    out.push({
      id: `q${String(startId + i).padStart(4, "0")}`,
      question: question + variant,
      category: cat,
      rarity,
      weight: weightForRarity(rarity),
      emoji,
      optionA: a,
      optionB: b,
      percentA: pctA,
      percentB: pctB,
      totalVotes: total,
      winner,
    });
  }
  return out;
}

let id = 1;
const all = [];
for (const cat of CATEGORIES) {
  all.push(...buildCategory(cat, id));
  id += 60;
}

if (all.length !== 300) {
  console.error("Expected 300 questions, got", all.length);
  process.exit(1);
}

const lines = all.map((q) => {
  const w = q.winner === "A" ? "A" : "B";
  return `  {
    id: ${JSON.stringify(q.id)},
    question: ${JSON.stringify(q.question)},
    category: ${JSON.stringify(q.category)},
    rarity: ${JSON.stringify(q.rarity)},
    weight: ${q.weight},
    emoji: ${JSON.stringify(q.emoji)},
    optionA: ${JSON.stringify(q.optionA)},
    optionB: ${JSON.stringify(q.optionB)},
    votes: { percentA: ${q.percentA}, percentB: ${q.percentB}, total: ${q.totalVotes}, winner: ${JSON.stringify(w)} },
  },`;
});

const out = `/* eslint-disable max-lines -- generated catalog (300 questions) */
import type { CatalogQuestion } from "@/lib/questionCatalog/types";

export const QUESTION_CATALOG: CatalogQuestion[] = [
${lines.join("\n")}
];

export const CATALOG_SIZE = ${all.length};
`;

writeFileSync(
  join(__dirname, "../data/questionCatalog.ts"),
  out,
  "utf8"
);
console.log("Wrote", all.length, "questions to data/questionCatalog.ts");
