"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import type { FinalResult } from "@/lib/types";
import { getShareText } from "@/lib/scoring";
import { downloadShareCard, renderShareCardPng } from "@/lib/shareCard";
import { endRankReward } from "@/lib/progression";
import { ArcadeButton } from "@/components/ui/ArcadeButton";
import { Confetti } from "@/components/ui/Confetti";
import { CharacterSprite } from "@/components/ui/CharacterSprite";
import { springFast, smoothLoop } from "@/lib/animations";
import { usePlayerStore } from "@/store/player";

interface FinalCastleProps {
  result: FinalResult;
  onPlayAgain: () => void;
}

export function FinalCastle({ result, onPlayAgain }: FinalCastleProps) {
  useEffect(() => {
    usePlayerStore.getState().setBestResult(endRankReward(result.matchPercent));
  }, [result.matchPercent]);

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
        <p className="font-arcade text-sm text-[#FBD000]">FINAL CASTLE</p>
        <p className="font-arcade text-xs text-white/80">{result.todayLabel}</p>

        <motion.h1
          className="font-display text-3xl sm:text-5xl text-white leading-tight max-w-lg"
          style={{ textShadow: "4px 4px 0 #3D2817" }}
          animate={{ scale: [1, 1.03, 1] }}
          transition={smoothLoop}
        >
          {result.title}
        </motion.h1>

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
          {[
            { label: "MATCH", value: `${result.matchPercent}%` },
            { label: "RARE", value: `${result.rareChoices}` },
            { label: "CHAOS", value: `${result.chaosScore}` },
          ].map((stat) => (
            <div
              key={stat.label}
              className="border-4 border-[#3D2817] bg-[#FBD000]/90 rounded-lg py-3 px-2 shadow-[4px_4px_0_#3D2817]"
            >
              <p className="font-arcade text-[8px] text-[#3D2817]">{stat.label}</p>
              <p className="font-display text-xl text-[#E52521]">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="border-4 border-[#3D2817] bg-black/20 rounded-xl px-5 py-3 w-full max-w-sm">
          <p className="font-arcade text-[10px] text-white/80">
            Score {result.runScore} · {result.playstyle}
          </p>
        </div>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ ...springFast, delay: 0.4 }}
          className="border-4 border-[#FFD700] bg-[#3D2817] rounded-2xl px-8 py-4"
        >
          <p className="font-display text-4xl sm:text-5xl">{result.badge}</p>
        </motion.div>

        <p className="font-arcade text-[10px] sm:text-xs text-white/80 max-w-sm">
          {result.description}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <ArcadeButton onClick={onPlayAgain} variant="primary">
            PLAY AGAIN
          </ArcadeButton>
          <ArcadeButton onClick={handleSharePng} variant="secondary">
            EXPORT PNG
          </ArcadeButton>
        </div>
      </motion.div>
    </div>
  );
}
