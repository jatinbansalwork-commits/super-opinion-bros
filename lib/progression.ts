import type { PlayerAnswer, PlayerRank } from "@/lib/types";
import { COIN_BOSS, internetTitleForLevel, levelFromCoins } from "@/lib/rewards";

export { COIN_BOSS, levelFromCoins, internetTitleForLevel };

export interface RankDisplay {
  rank: PlayerRank;
  emoji: string;
  label: string;
  tagline: string;
}

export const MATCH_RANKS: {
  rank: PlayerRank;
  minMatch: number;
  emoji: string;
  label: string;
  tagline: string;
}[] = [
  {
    rank: "contrarian",
    minMatch: 0,
    emoji: "🥷",
    label: "Contrarian",
    tagline: "Votes against the herd.",
  },
  {
    rank: "lurker",
    minMatch: 26,
    emoji: "👀",
    label: "Quiet Voter",
    tagline: "Reads the room. Rarely posts.",
  },
  {
    rank: "main-character",
    minMatch: 46,
    emoji: "🙂",
    label: "Main Character",
    tagline: "The timeline revolves around you.",
  },
  {
    rank: "trend-reader",
    minMatch: 66,
    emoji: "🧠",
    label: "Trend Reader",
    tagline: "You smell a ratio coming.",
  },
  {
    rank: "internet-oracle",
    minMatch: 81,
    emoji: "👑",
    label: "Internet Oracle",
    tagline: "You ARE the algorithm.",
  },
];

export const CROWD_ENERGY = [
  { level: 1 as const, emoji: "🙂", label: "Calm" },
  { level: 2 as const, emoji: "🔥", label: "Heated" },
  { level: 3 as const, emoji: "☠️", label: "Terminally Online" },
];

export function computeMatchPercent(answers: PlayerAnswer[]): number {
  if (answers.length === 0) return 0;
  const matches = answers.filter((a) => a.matchedMajority).length;
  return Math.round((matches / answers.length) * 100);
}

export function rankFromMatchPercent(
  matchPercent: number,
  answerCount = 0
): PlayerRank {
  if (answerCount === 0) return "lurker";
  let current = MATCH_RANKS[0]!;
  for (const r of MATCH_RANKS) {
    if (matchPercent >= r.minMatch) current = r;
  }
  return current.rank;
}

export function rankDisplay(
  matchPercent: number,
  answerCount = 0
): RankDisplay {
  const rank = rankFromMatchPercent(matchPercent, answerCount);
  const meta =
    MATCH_RANKS.find((r) => r.rank === rank) ?? MATCH_RANKS[1]!;
  return {
    rank,
    emoji: meta.emoji,
    label: meta.label,
    tagline: meta.tagline,
  };
}

export function rankDisplayLabel(
  matchPercent: number,
  answerCount = 0
): string {
  const { emoji, label } = rankDisplay(matchPercent, answerCount);
  return `${emoji} ${label}`;
}

export function endRankReward(matchPercent: number): {
  order: number;
  title: string;
  flavor: string;
} {
  if (matchPercent <= 25) {
    return {
      order: 0,
      title: "🥷 CONTRARIAN",
      flavor: "Votes against the herd.",
    };
  }
  if (matchPercent <= 45) {
    return {
      order: 1,
      title: "👀 INTERNET OBSERVER",
      flavor: "Quiet… but suspiciously accurate.",
    };
  }
  if (matchPercent <= 65) {
    return {
      order: 2,
      title: "🙂 MAIN CHARACTER",
      flavor: "Reads the room surprisingly well.",
    };
  }
  if (matchPercent <= 80) {
    return {
      order: 3,
      title: "🧠 TREND READER",
      flavor: "Catches the vibe before it hits.",
    };
  }
  return {
    order: 4,
    title: "👑 INTERNET ORACLE",
    flavor: "The algorithm fears you.",
  };
}

export function checkpointBadge(completed: number): string {
  if (completed >= 20) return "Internet Legend";
  if (completed >= 15) return "Opinion Duke";
  if (completed >= 10) return "Hot Take Knight";
  if (completed >= 5) return "Opinion Knight";
  return "Debate Scout";
}
