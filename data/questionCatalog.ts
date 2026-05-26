import type {
  CatalogQuestion,
  QuestionCategory,
  QuestionRarity,
} from "@/lib/questionCatalog/types";
import {
  CATALOG_CATEGORIES,
  CATEGORY_TEMPLATES,
  type CatalogCategory,
} from "@/data/catalogTemplates";

export const CATALOG_SIZE = 10_000;

const PER_CATEGORY = Math.floor(CATALOG_SIZE / CATALOG_CATEGORIES.length);

let catalogCache: CatalogQuestion[] | null = null;
const byIdCache = new Map<string, CatalogQuestion>();
const byCategoryCache = new Map<QuestionCategory, CatalogQuestion[]>();

function rarityForSlot(slot: number): QuestionRarity {
  const roll = slot % 100;
  if (roll < 60) return "common";
  if (roll < 85) return "uncommon";
  if (roll < 95) return "rare";
  return "cursed";
}

function weightForRarity(r: QuestionRarity): number {
  if (r === "cursed") return 0.45;
  if (r === "rare") return 0.65;
  if (r === "uncommon") return 0.85;
  return 1;
}

function normalizeCategory(cat: CatalogCategory): QuestionCategory {
  if (cat === "pop-culture") return "pop-culture";
  return cat;
}

function buildOne(globalIndex: number): CatalogQuestion {
  const catIndex = Math.floor(globalIndex / PER_CATEGORY);
  const cat = CATALOG_CATEGORIES[catIndex] ?? "random";
  const slotInCat = globalIndex % PER_CATEGORY;
  const templates = CATEGORY_TEMPLATES[cat];
  const t = templates[slotInCat % templates.length]!;
  const cycle = Math.floor(slotInCat / templates.length);
  const [question, emoji, optionA, optionB, percentA, percentB] = t;
  const rarity = rarityForSlot(globalIndex + cycle * 17);
  const winner = percentA >= percentB ? "A" : "B";
  const id = `q${String(globalIndex + 1).padStart(5, "0")}`;

  return {
    id,
    question,
    category: normalizeCategory(cat),
    rarity,
    weight: weightForRarity(rarity),
    emoji,
    optionA,
    optionB,
    votes: {
      percentA,
      percentB,
      total: 3_000_000 + ((globalIndex + 1) * 137_891) % 15_000_000,
      winner,
    },
    special: rarity === "cursed" || rarity === "rare",
  };
}

function buildCatalog(): CatalogQuestion[] {
  const all: CatalogQuestion[] = [];
  for (let i = 0; i < CATALOG_SIZE; i++) {
    const q = buildOne(i);
    all.push(q);
    byIdCache.set(q.id, q);
  }
  for (const cat of CATALOG_CATEGORIES) {
    const norm = normalizeCategory(cat);
    byCategoryCache.set(
      norm,
      all.filter((q) => q.category === norm)
    );
  }
  return all;
}

export function getAllCatalogQuestions(): CatalogQuestion[] {
  if (!catalogCache) catalogCache = buildCatalog();
  return catalogCache;
}

export function getCatalogQuestion(id: string): CatalogQuestion | undefined {
  if (!byIdCache.size) getAllCatalogQuestions();
  return byIdCache.get(id);
}

export function getCatalogByCategory(
  category: QuestionCategory
): CatalogQuestion[] {
  if (!byCategoryCache.size) getAllCatalogQuestions();
  return byCategoryCache.get(category) ?? [];
}

export const QUESTION_CATALOG = new Proxy([] as CatalogQuestion[], {
  get(_target, prop) {
    const all = getAllCatalogQuestions();
    if (prop === "length") return all.length;
    if (prop === "slice") return all.slice.bind(all);
    if (typeof prop === "string" && /^\d+$/.test(prop)) {
      return all[Number(prop)];
    }
    const value = Reflect.get(all, prop);
    return typeof value === "function" ? value.bind(all) : value;
  },
});
