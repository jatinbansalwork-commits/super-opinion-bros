const CROWD_MOODS = [
  { emoji: "😴", label: "Quiet Internet" },
  { emoji: "🍿", label: "Debating" },
  { emoji: "🔥", label: "Terminally Online" },
  { emoji: "🧠", label: "Thinkpiece Mode" },
] as const;

function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function pickCrowdEnergy(
  seed: number,
  gateIndex: number
): { emoji: string; label: string } {
  const rng = mulberry32(seed + gateIndex * 997);
  const idx = Math.floor(rng() * CROWD_MOODS.length);
  return CROWD_MOODS[idx] ?? CROWD_MOODS[0];
}
