import type { CatalogQuestion } from "@/lib/questionCatalog/types";
import type { Question } from "@/lib/types";
import { getWorldTheme } from "@/data/worlds";
import { displayQuestionTitle } from "@/lib/questionDisplay";
import type { QuestionResult } from "@/lib/types";
import type { QuestionMutationId, QuestionSurpriseMeta } from "./types";
import { RARE_QUESTIONS } from "./rareQuestions";

const MUTATION_CHANCE = 0.1;
const RARE_CHANCE = 0.05;

function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function catalogToQuestion(
  cq: CatalogQuestion,
  worldIndex: number,
  meta: QuestionSurpriseMeta
): Question {
  const theme = getWorldTheme(worldIndex);
  const result: QuestionResult = {
    winner: cq.votes.winner,
    percentA: cq.votes.percentA,
    percentB: cq.votes.percentB,
    totalVotes: cq.votes.total,
  };
  let title = displayQuestionTitle(cq.question);
  if (meta.mutation === "speedrun") {
    title = `Internet speedrun:\n${title.toUpperCase()}?!`;
  } else if (meta.mutation === "caps-lock") {
    title = title.toUpperCase();
  } else if (meta.mutation === "breaking-news") {
    title = `BREAKING:\n${title}`;
  }

  return {
    id: cq.id,
    world: worldIndex + 1,
    worldName: theme.name,
    kingdom: meta.isRare ? "RARE EVENT" : cq.special ? "WILD CARD" : theme.kingdom,
    title,
    emoji: cq.emoji,
    optionA: cq.optionA,
    optionB: cq.optionB,
    result,
    isRare: meta.isRare,
    mutation: meta.mutation,
  };
}

export function applyQuestionSurprises(
  catalogQuestions: CatalogQuestion[],
  seed: number
): {
  questions: Question[];
  surpriseMeta: Record<string, QuestionSurpriseMeta>;
} {
  const rng = mulberry32(seed);
  const surpriseMeta: Record<string, QuestionSurpriseMeta> = {};
  const usedRare = new Set<string>();

  const questions = catalogQuestions.map((cq, i) => {
    const roll = rng();
    if (roll < RARE_CHANCE) {
      const pool = RARE_QUESTIONS.filter((r) => !usedRare.has(r.id));
      const rare = pool[Math.floor(rng() * pool.length)] ?? RARE_QUESTIONS[0]!;
      usedRare.add(rare.id);
      const meta: QuestionSurpriseMeta = { isRare: true };
      surpriseMeta[rare.id] = meta;
      return catalogToQuestion(rare, i, meta);
    }

    let mutation: QuestionMutationId | undefined;
    if (roll < RARE_CHANCE + MUTATION_CHANCE) {
      const mutations: QuestionMutationId[] = [
        "speedrun",
        "caps-lock",
        "breaking-news",
      ];
      mutation = mutations[Math.floor(rng() * mutations.length)];
    }

    const meta: QuestionSurpriseMeta = { mutation };
    surpriseMeta[cq.id] = meta;
    return catalogToQuestion(cq, i, meta);
  });

  return { questions, surpriseMeta };
}

import { flashDurationMs, pickInternetGateEvent } from "./gateEvents";
import { pickCrowdEnergy } from "./crowdEnergy";
import { pickMicroMoment } from "./microMoments";
import type { GateSurpriseBundle } from "./types";

export function buildGateSurprises(
  seed: number,
  gateIndex: number
): GateSurpriseBundle {
  const gateEvent = pickInternetGateEvent(seed, gateIndex);
  const crowdEnergy = pickCrowdEnergy(seed, gateIndex);
  const micro = pickMicroMoment(seed, gateIndex);
  const flashMs = gateEvent ? flashDurationMs(seed, gateIndex) : 0;
  const rng = mulberry32(seed + gateIndex * 9001);
  const eventRandomBonus =
    gateEvent?.id === "everyone-opinions"
      ? 15 + Math.floor(rng() * 66)
      : undefined;
  return { gateEvent, crowdEnergy, micro, flashMs, eventRandomBonus };
}
