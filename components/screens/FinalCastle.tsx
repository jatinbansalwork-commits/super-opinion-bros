"use client";

import { motion } from "framer-motion";
import type { FinalResult } from "@/lib/types";
import { getShareText } from "@/lib/scoring";
import { downloadShareCard, renderShareCardPng } from "@/lib/shareCard";
import { endRankReward } from "@/lib/progression";
import { ArcadeButton } from "@/components/ui/ArcadeButton";
import { Confetti } from "@/components/ui/Confetti";
import { CharacterSprite } from "@/components/ui/CharacterSprite";
import { NextRunPicker } from "@/components/screens/NextRunPicker";
import type { NextRunModifier } from "@/lib/types";
import { springFast, smoothLoop } from "@/lib/animations";

interface FinalCastleProps {
  result: FinalResult;
  onStartNextRun: (modifier: NextRunModifier) => void;
}

const STAGGER_MS = 200;

const RESULT_STATS = (result: FinalResult) => [
  {
    key: "crowd",
    emoji: "🎯",
    label: "CROWD READ",
    value: `${result.crowdReadPercent}%`,
    helper: "You guessed with the crowd",
    delay: 0.35,
  },
  {
    key: "hot",
    emoji: "🔥",
    label: "HOT TAKES",
    value: `${result.hotTakes}`,
    helper: "You won against expectations",
    delay: 0.35 + STAGGER_MS / 1000,
  },
  {
    key: "surprise",
    emoji: "🌪",
    label: "SURPRISES",
    value: result.surpriseTier,
    helper: "Weird internet moments triggered",
    delay: 0.35 + (STAGGER_MS * 2) / 1000,
  },
];

export function FinalCastle({ result, onStartNextRun }: FinalCastleProps) {
  const handleShareText = async () => {
    const text = getShareText(result);
    if (navigator.share) {
      try {
        await navigator.share({ title: "Super Opinion Bros", text });
        return;
      } catch {
        /* fall through */
      }
    }
    await navigator.clipboard.writeText(text);
  };

  const handleSharePng = async () => {
    const blob = await renderShareCardPng(result);
    if (blob) downloadShareCard(blob);
    else await handleShareText();
  };

  const stats = RESULT_STATS(result);
  const summaryDelay = 0.35 + (STAGGER_MS * 3) / 1000;

  return (
    <div className="relative h-full w-full overflow-hidden bg-gradient-to-b from-[#1a0a2e] via-[#4a1942] to-[#2D1B4E]">
      <Confetti />

      <motion.div
        className="absolute bottom-0 left-0 right-0 flex justify-center gap-2 pb-4 opacity-40 text-6xl"
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <span>🏰</span>
        <span>👑</span>
        <span>🏰</span>
      </motion.div>

      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={springFast}
        className="relative z-10 flex h-full flex-col items-center justify-center gap-3 px-6 text-center overflow-y-auto py-8"
      >
        <motion.p
          className="font-arcade text-sm text-[#FBD000]"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springFast, delay: 0.1 }}
        >
          FINAL CASTLE
        </motion.p>

        <motion.h1
          className="font-display text-3xl sm:text-5xl text-white leading-tight max-w-lg"
          style={{ textShadow: "4px 4px 0 #3D2817" }}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ scale: [0.92, 1.03, 1], opacity: 1 }}
          transition={{ ...smoothLoop, delay: 0.15 }}
        >
          {result.title}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ ...springFast, delay: 0.22 }}
          className="font-arcade text-[10px] sm:text-xs text-white/85 max-w-sm"
        >
          {result.flavorLine}
        </motion.p>

        {result.bestTitle && result.bestTitle !== result.title && (
          <p className="font-arcade text-[9px] text-[#FBD000]/80">
            Best title saved: {result.bestTitle}
          </p>
        )}

        <CharacterSprite mood="happy" size="lg" />

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springFast, delay: 0.25 }}
          className="border-4 border-[#3D2817] bg-[#FBD000]/90 rounded-xl px-6 py-4 w-full max-w-sm"
        >
          <p className="font-arcade text-[10px] text-[#3D2817]">
            TODAY YOU WERE…
          </p>
          <motion.p
            className="font-display text-2xl sm:text-3xl text-[#E52521] mt-1"
            initial={{ scale: 0.85 }}
            animate={{ scale: [0.85, 1.06, 1] }}
            transition={{ ...springFast, delay: 0.35 }}
          >
            {endRankReward(result.matchPercent).title}
          </motion.p>
          <p className="font-arcade text-[10px] text-[#3D2817] mt-2">
            “{result.rankFlavor}”
          </p>
        </motion.div>

        <div className="grid grid-cols-3 gap-3 w-full max-w-md">
          {stats.map((stat) => (
            <motion.div
              key={stat.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...springFast, delay: stat.delay }}
              className="border-4 border-[#3D2817] bg-[#FBD000]/90 rounded-lg py-3 px-2 shadow-[4px_4px_0_#3D2817] flex flex-col"
            >
              <p className="font-arcade text-[8px] text-[#3D2817] leading-tight">
                {stat.emoji} {stat.label}
              </p>
              <p className="font-display text-xl text-[#E52521] mt-1">
                {stat.value}
              </p>
              <p className="font-arcade text-[7px] text-[#3D2817]/80 mt-1 leading-snug">
                {stat.helper}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="border-4 border-[#3D2817] bg-black/20 rounded-xl px-5 py-3 w-full max-w-sm">
          <p className="font-arcade text-[10px] text-white/80">
            🪙 {result.runCoins} coins · {result.playstyle}
          </p>
        </div>

        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ ...springFast, delay: 0.4 }}
          className="border-4 border-[#FFD700] bg-[#3D2817] rounded-2xl px-8 py-4"
        >
          <p className="font-display text-4xl sm:text-5xl">{result.badge}</p>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springFast, delay: summaryDelay }}
          className="font-arcade text-[10px] sm:text-xs text-white/90 max-w-sm"
        >
          {result.summaryLine}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springFast, delay: summaryDelay + 0.15 }}
          className="w-full flex justify-center mt-2"
        >
          <NextRunPicker onPick={onStartNextRun} />
        </motion.div>

        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <ArcadeButton onClick={handleSharePng} variant="secondary">
            EXPORT PNG
          </ArcadeButton>
        </div>
      </motion.div>
    </div>
  );
}
