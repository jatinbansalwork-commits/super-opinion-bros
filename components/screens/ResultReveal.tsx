"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { audio } from "@/lib/audio";
import { tierLabel } from "@/lib/chaosScoring";
import type { Question, AnswerChoice, LastPredictionResult } from "@/lib/types";
import { useCountUp } from "@/hooks/useCountUp";
import { ArcadeButton } from "@/components/ui/ArcadeButton";
import { smooth, smoothIn } from "@/lib/animations";

interface ResultRevealProps {
  question: Question;
  playerChoice: AnswerChoice;
  prediction?: LastPredictionResult | null;
  onContinue: () => void;
  continuing?: boolean;
}

export function ResultReveal({
  question,
  playerChoice,
  prediction,
  onContinue,
  continuing = false,
}: ResultRevealProps) {
  const { result } = question;
  const winner = result.winner;
  const winnerLabel =
    winner === "A" ? question.optionA : question.optionB;
  const tier = prediction?.tier ?? "wrong";
  const points = prediction?.pointsEarned ?? 0;

  const animatedVotes = useCountUp(result.totalVotes, 1400, true);
  const animatedYes = useCountUp(result.percentA, 1000, true);
  const animatedNo = useCountUp(result.percentB, 1000, true);
  const animatedPoints = useCountUp(points, 800, true);

  useEffect(() => {
    if (tier === "wrong") audio.playSfx("lose");
    else audio.playSfx("reveal");
    if (points > 0) audio.playSfx("start");
  }, [tier, points]);

  return (
    <motion.div
      className="absolute inset-0 z-30 flex items-center justify-center px-4 pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={smoothIn}
    >
      <div
        className="pointer-events-auto w-full max-w-[640px] flex flex-col items-center gap-4 sm:gap-5 py-4"
        role="dialog"
        aria-label="Result"
      >
        <p className="font-arcade text-xs sm:text-sm text-white text-center drop-shadow-[2px_2px_0_#3D2817]">
          THE INTERNET HAS DECIDED
        </p>
        <p className="font-arcade text-[10px] text-white/80">
          You predicted: {playerChoice === "A" ? question.optionA : question.optionB}
        </p>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.12, 1] }}
          transition={{ ...smoothIn, delay: 0.1 }}
          className="text-5xl sm:text-6xl leading-none"
        >
          {tier === "exact" ? "✓" : tier === "close" ? "~" : "✗"}
        </motion.div>

        <div className="text-center w-full">
          <p
            className="font-display text-xl sm:text-3xl text-[#FBD000] uppercase tracking-wide"
            style={{ textShadow: "2px 2px 0 #3D2817" }}
          >
            {winnerLabel} WINS
          </p>
        </div>

        <div className="w-full border-4 border-[#3D2817] bg-black/40 rounded-xl p-4">
          <div className="h-10 sm:h-12 rounded-lg overflow-hidden border-2 border-[#3D2817] flex bg-[#E52521]">
            <motion.div
              className="h-full bg-[#43B047]"
              initial={{ width: 0 }}
              animate={{ width: `${animatedYes}%` }}
              transition={smooth}
            />
          </div>
          <div className="flex justify-between mt-3 font-arcade text-xs sm:text-sm text-white">
            <span>{animatedYes}%</span>
            <span>{animatedNo}%</span>
          </div>
        </div>

        <p className="font-arcade text-xs text-white/90">
          {animatedVotes >= 1_000_000
            ? `${(animatedVotes / 1_000_000).toFixed(0)}M votes`
            : `${animatedVotes.toLocaleString()} votes`}
        </p>

        <div className="border-4 border-[#3D2817] bg-[#FBD000] rounded-xl px-6 py-3 text-center relative overflow-visible">
          {points > 0 && (
            <motion.span
              className="absolute -top-6 right-4 text-2xl"
              initial={{ y: 12, opacity: 0, scale: 0.5 }}
              animate={{ y: -8, opacity: [0, 1, 0], scale: 1 }}
              transition={{ duration: 0.7 }}
              aria-hidden
            >
              🪙
            </motion.span>
          )}
          <p className="font-arcade text-[10px] text-[#3D2817]">{tierLabel(tier)}</p>
          <p className="font-display text-3xl text-[#E52521]">+{animatedPoints}</p>
          {prediction && prediction.comboMultiplier > 1 && (
            <p className="font-arcade text-[10px] text-[#3D2817]">
              COMBO ×{prediction.comboMultiplier.toFixed(2)}
            </p>
          )}
        </div>

        <div className="mt-6 w-full flex justify-center">
          <ArcadeButton
            onClick={onContinue}
            variant="secondary"
            disabled={continuing}
          >
            {continuing ? "..." : "CONTINUE"}
          </ArcadeButton>
        </div>
      </div>
    </motion.div>
  );
}
