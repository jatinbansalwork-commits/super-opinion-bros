import type { InternetGateEvent } from "./types";
import {
  loadSurpriseTracker,
  recordGateEventSeen,
  saveSurpriseTracker,
} from "./tracker";

export const INTERNET_GATE_EVENTS: InternetGateEvent[] = [
  {
    id: "hot-take",
    emoji: "🌶",
    title: "HOT TAKE",
    hint: "Correct = double coins",
  },
  {
    id: "crowd-flip",
    emoji: "🌀",
    title: "CROWD FLIP",
    hint: "Minority wins",
  },
  {
    id: "ghost-votes",
    emoji: "👻",
    title: "GHOST VOTES",
    hint: "Hide percentages",
  },
  {
    id: "main-character",
    emoji: "📢",
    title: "MAIN CHARACTER DAY",
    hint: "Majority amplified",
  },
  {
    id: "bot-invasion",
    emoji: "🤖",
    title: "BOT INVASION",
    hint: "Votes become unstable",
  },
  {
    id: "everyone-opinions",
    emoji: "🍿",
    title: "EVERYONE HAS OPINIONS",
    hint: "Random reward",
  },
];

const GATE_EVENT_CHANCE = 0.2;

function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function pickInternetGateEvent(
  seed: number,
  gateIndex: number
): InternetGateEvent | null {
  const rng = mulberry32(seed + gateIndex * 7919);
  if (rng() > GATE_EVENT_CHANCE) return null;

  const tracker = loadSurpriseTracker();
  let pool = INTERNET_GATE_EVENTS;
  if (tracker.lastGateEventId) {
    const filtered = pool.filter((e) => e.id !== tracker.lastGateEventId);
    if (filtered.length > 0) pool = filtered;
  }

  return pool[Math.floor(rng() * pool.length)] ?? null;
}

export function flashDurationMs(seed: number, gateIndex: number): number {
  const rng = mulberry32(seed + gateIndex * 313);
  return 500 + Math.floor(rng() * 700);
}

export function commitGateEventShown(event: InternetGateEvent): void {
  const tracker = loadSurpriseTracker();
  saveSurpriseTracker(recordGateEventSeen(tracker, event.id));
}
