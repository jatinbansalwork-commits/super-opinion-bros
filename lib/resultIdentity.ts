import type { SurpriseTier } from "@/lib/types";
import { saveBestTitle } from "@/lib/playerRetention";

export interface ResultIdentityInput {
  crowdReadPercent: number;
  hotTakes: number;
  surpriseTier: SurpriseTier;
  totalQuestions: number;
  bossWins: number;
  bossAttempts: number;
}

export interface ResultIdentity {
  title: string;
  flavorLine: string;
  badge: string;
  playstyle: string;
  variant:
    | "hero"
    | "chaos"
    | "timeline"
    | "rebel"
    | "oracle"
    | "npc"
    | "king"
    | "algorithm"
    | "knight"
    | "goblin"
    | "prophet";
}

export function buildResultIdentity(
  input: ResultIdentityInput
): ResultIdentity {
  const {
    crowdReadPercent,
    hotTakes,
    surpriseTier,
    totalQuestions,
    bossWins,
    bossAttempts,
  } = input;

  const hotThreshold = Math.max(3, Math.ceil(totalQuestions * 0.35));
  const bossCrushed = bossAttempts > 0 && bossWins === bossAttempts;

  let title = "MAIN CHARACTER";
  let flavorLine = "You showed up and the feed noticed.";
  let badge = "🙂 AVERAGE LEGEND";
  let playstyle = "Balanced predictor";
  let variant: ResultIdentity["variant"] = "npc";

  if (crowdReadPercent >= 90) {
    title = "INTERNET ORACLE";
    flavorLine = "You understood the assignment.";
    badge = "👑 CROWN VERIFIED";
    playstyle = "Crowd oracle";
    variant = "oracle";
  } else if (surpriseTier === "MAXIMUM" || surpriseTier === "HIGH") {
    title = "CHAOS TOURIST";
    flavorLine = "The internet refused to behave.";
    badge = "🌪 TIMELINE TOURIST";
    playstyle = "Surprise collector";
    variant = "chaos";
  } else if (hotTakes >= hotThreshold) {
    title = "ALGORITHM BREAKER";
    flavorLine = "You trusted the chaos.";
    badge = "⚡ UNEXPECTED ICON";
    playstyle = "Hot take specialist";
    variant = "rebel";
  } else if (crowdReadPercent >= 70) {
    title = "CROWD READER";
    flavorLine = "The timeline bent for you.";
    badge = "🎯 ROOM READER";
    playstyle = "Majority whisperer";
    variant = "prophet";
  } else if (bossCrushed) {
    title = "BOSS SLAYER";
    flavorLine = "You read the room and the castle.";
    badge = "🏰 CASTLE CLEARED";
    playstyle = "Boss hunter";
    variant = "knight";
  } else if (crowdReadPercent >= 50 && hotTakes <= 2) {
    title = "MAIN CHARACTER";
    flavorLine = "Not lucky. Just suspiciously online.";
    badge = "📱 FEED FAMOUS";
    playstyle = "Timeline regular";
    variant = "hero";
  }

  saveBestTitle(title);

  return { title, flavorLine, badge, playstyle, variant };
}
