"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { audio } from "@/lib/audio";
import {
  getInternetAgreement,
  getRunProgress,
  progressBar,
} from "@/lib/checkpoint";
import { checkpointBadge } from "@/lib/progression";
import { computeRouteScores } from "@/lib/routes";
import type { PlayerAnswer } from "@/lib/types";
import { ArcadeButton } from "@/components/ui/ArcadeButton";
import { springFast, smoothIn } from "@/lib/animations";
import { useGameStore } from "@/store/gameStore";
import { usePlayerStore } from "@/store/player";

interface CastleCheckpointProps {
  playerAnswers: PlayerAnswer[];
  onContinue: () => void;
}

export function CastleCheckpoint({
  playerAnswers,
  onContinue,
}: CastleCheckpointProps) {
  const runCoins = usePlayerStore((s) => s.runCoins);
  const runLength = useGameStore((s) => s.runLength);
  const completed = playerAnswers.length;
  const { filled, total } = getRunProgress(completed, runLength);
  const agreement = getInternetAgreement(playerAnswers);
  const scores = computeRouteScores(playerAnswers);
  const badge = checkpointBadge(completed);

  useEffect(() => {
    audio.playSfx("win");
  }, []);

  return (
    <motion.div
      className="absolute inset-0 z-30 flex items-center justify-center px-4 bg-black/25"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        initial={{ scale: 0.85, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        transition={springFast}
        className="w-full max-w-md border-8 border-[#3D2817] bg-[#5C94FC] rounded-2xl p-6 sm:p-8 text-center shadow-[8px_8px_0_#3D2817] relative overflow-hidden"
      >
        <motion.div
          className="absolute -top-2 left-1/2 -translate-x-1/2 text-4xl origin-bottom"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1, rotate: [-6, 6, -6] }}
          transition={{
            y: { delay: 0.3, ...smoothIn },
            opacity: { delay: 0.3, ...smoothIn },
            rotate: { duration: 1.2, repeat: Infinity, ease: "easeInOut" },
          }}
        >
          🚩
        </motion.div>

        <motion.h2
          className="font-display text-3xl sm:text-4xl text-[#FBD000] mt-6"
          style={{ textShadow: "3px 3px 0 #3D2817" }}
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          CASTLE CLEAR
        </motion.h2>

        <div className="mt-6 space-y-3 text-left">
          <div className="flex justify-between font-arcade text-[10px] text-white">
            <span>INTERNET MATCH</span>
            <span>{agreement}%</span>
          </div>
          <div className="flex justify-between font-arcade text-[10px] text-white">
            <span>CHAOS</span>
            <span>{scores.chaosScore}%</span>
          </div>
          <div>
            <p className="font-arcade text-[10px] text-white/80 mb-1">PROGRESS</p>
            <p className="font-arcade text-sm text-[#FBD000] tracking-widest text-center">
              {progressBar(filled, total)}
            </p>
          </div>
        </div>

        <motion.div
          className="mt-5 border-4 border-[#3D2817] bg-[#FBD000] rounded-xl py-3"
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.15, 1] }}
          transition={{ delay: 0.4, ...smoothIn }}
        >
          <p className="font-arcade text-[10px] text-[#3D2817]">COINS</p>
          <p className="font-display text-3xl text-[#E52521]">{runCoins}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-4 font-arcade text-xs text-white"
        >
          Badge: {badge}
        </motion.div>

        {Array.from({ length: 8 }).map((_, i) => (
          <motion.span
            key={i}
            className="absolute text-lg pointer-events-none"
            initial={{ opacity: 0, y: 0, x: `${10 + i * 10}%` }}
            animate={{
              opacity: [0, 1, 0],
              y: [0, -40, -80],
            }}
            transition={{ delay: 0.2 + i * 0.08, duration: 1.2 }}
            style={{ bottom: "20%", left: `${5 + i * 12}%` }}
          >
            🪙
          </motion.span>
        ))}

        <div className="mt-8">
          <ArcadeButton onClick={onContinue} variant="secondary">
            CONTINUE
          </ArcadeButton>
        </div>
      </motion.div>
    </motion.div>
  );
}
