import type { MicroMoment } from "./types";
import { loadSurpriseTracker, recordMicroSeen, saveSurpriseTracker } from "./tracker";

const MICRO_CHANCE = 0.01;

const CLOUD_LINES = [
  "wrong timeline",
  "the feed is watching",
  "someone is typing…",
  "ratio incoming",
  "this feels cursed",
];

function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function pickMicroMoment(
  seed: number,
  gateIndex: number
): MicroMoment | null {
  const rng = mulberry32(seed + gateIndex * 4201);
  if (rng() > MICRO_CHANCE) return null;

  const tracker = loadSurpriseTracker();
  const roll = rng();
  let micro: MicroMoment;

  if (roll < 0.35) {
    micro = {
      id: "do-not-click",
      buttonLabel: "DO NOT CLICK",
      coinBonus: 10,
    };
  } else if (roll < 0.6) {
    micro = {
      id: "cloud-whisper",
      message: CLOUD_LINES[Math.floor(rng() * CLOUD_LINES.length)],
    };
  } else if (roll < 0.85) {
    micro = { id: "bg-flicker" };
  } else {
    micro = { id: "wrong-timeline", message: "wrong timeline" };
  }

  saveSurpriseTracker(recordMicroSeen(tracker, micro.id));
  return micro;
}
