import type { AnswerChoice } from "@/lib/types";

export type InternetGateEventId =
  | "hot-take"
  | "crowd-flip"
  | "ghost-votes"
  | "main-character"
  | "bot-invasion"
  | "everyone-opinions";

export type QuestionMutationId = "speedrun" | "caps-lock" | "breaking-news";

export type MicroMomentId =
  | "do-not-click"
  | "cloud-whisper"
  | "bg-flicker"
  | "wrong-timeline";

export interface InternetGateEvent {
  id: InternetGateEventId;
  emoji: string;
  title: string;
  hint: string;
}

export interface QuestionSurpriseMeta {
  mutation?: QuestionMutationId;
  isRare?: boolean;
  rareTitle?: string;
  rareEmoji?: string;
}

export interface MicroMoment {
  id: MicroMomentId;
  message?: string;
  buttonLabel?: string;
  coinBonus?: number;
}

export interface GateSurpriseBundle {
  gateEvent: InternetGateEvent | null;
  crowdEnergy: { emoji: string; label: string };
  micro: MicroMoment | null;
  flashMs: number;
  /** Frozen at roll time for everyone-opinions. */
  eventRandomBonus?: number;
}

export interface SurpriseTrackerState {
  version: number;
  eventsSeen: Record<string, number>;
  lastGateEventId: string | null;
  microSeen: string[];
  newsIndex: number;
}

export interface GateEventModifiers {
  reverseInternet: boolean;
  doubleOnMatch: boolean;
  hideVotes: boolean;
  majorityBonus: boolean;
  unstableVotes: boolean;
  randomBonusCoins: number | null;
}

export function gateEventModifiers(
  eventId: InternetGateEventId | null,
  frozenRandomBonus?: number
): GateEventModifiers {
  if (!eventId) {
    return {
      reverseInternet: false,
      doubleOnMatch: false,
      hideVotes: false,
      majorityBonus: false,
      unstableVotes: false,
      randomBonusCoins: null,
    };
  }
  switch (eventId) {
    case "hot-take":
      return {
        reverseInternet: false,
        doubleOnMatch: true,
        hideVotes: false,
        majorityBonus: false,
        unstableVotes: false,
        randomBonusCoins: null,
      };
    case "crowd-flip":
      return {
        reverseInternet: true,
        doubleOnMatch: false,
        hideVotes: false,
        majorityBonus: false,
        unstableVotes: false,
        randomBonusCoins: null,
      };
    case "ghost-votes":
      return {
        reverseInternet: false,
        doubleOnMatch: false,
        hideVotes: true,
        majorityBonus: false,
        unstableVotes: false,
        randomBonusCoins: null,
      };
    case "main-character":
      return {
        reverseInternet: false,
        doubleOnMatch: false,
        hideVotes: false,
        majorityBonus: true,
        unstableVotes: false,
        randomBonusCoins: null,
      };
    case "bot-invasion":
      return {
        reverseInternet: false,
        doubleOnMatch: false,
        hideVotes: false,
        majorityBonus: false,
        unstableVotes: true,
        randomBonusCoins: null,
      };
    case "everyone-opinions":
      return {
        reverseInternet: false,
        doubleOnMatch: false,
        hideVotes: false,
        majorityBonus: false,
        unstableVotes: false,
        randomBonusCoins:
          frozenRandomBonus ?? 15 + Math.floor(Math.random() * 66),
      };
    default:
      return gateEventModifiers(null);
  }
}

export function unstableWinner(
  percentA: number,
  percentB: number,
  seed: number
): AnswerChoice {
  const jitter = ((seed % 17) - 8) / 100;
  const a = Math.max(5, Math.min(95, percentA + jitter * 100));
  return a >= 50 ? "A" : "B";
}
