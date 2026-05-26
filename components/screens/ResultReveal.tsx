"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { audio } from "@/lib/audio";
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

function choiceLabel(question: Question, choice: AnswerChoice): string {
  const text = choice === "A" ? question.optionA : question.optionB;
  const upper = text.toUpperCase();
  if (upper === "YES" || upper === "NO") return upper;
  return text;
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
  const winnerPct =
    winner === "A" ? result.percentA : result.percentB;
  const coins = prediction?.coinsEarned ?? 0;
  const votesHidden = question.modifier === "votes-hidden";
  const isRare = question.isRare;
  const animatedCoins = useCountUp(coins, 800, true);
  const animatedYes = useCountUp(result.percentA, 1000, true);
  const animatedNo = useCountUp(result.percentB, 1000, true);

  const youLabel = choiceLabel(question, playerChoice);
  const internetLabel = choiceLabel(question, winner);

  useEffect(() => {
    if (coins === 0) audio.playSfx("lose");
    else audio.playSfx("reveal");
    if (coins > 0) audio.playSfx("start");
  }, [coins]);

  return (
    <motion.div
      className="absolute inset-0 z-30 flex items-center justify-center px-4 pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={smoothIn}
    >
      <div
        className="pointer-events-auto w-full max-w-[640px] flex flex-col items-center gap-5 py-4"
        role="dialog"
        aria-label="Result"
      >
        <p className="font-arcade text-xs sm:text-sm text-white text-center drop-shadow-[2px_2px_0_#3D2817]">
          THE INTERNET HAS SPOKEN
        </p>

        <div className="text-center space-y-2 font-arcade text-[11px] sm:text-xs text-white/90">
          <p>You guessed: {youLabel}</p>
          <p>
            Internet chose: {internetLabel}
            {!votesHidden && ` (${winnerPct}%)`}
          </p>
        </div>

        {votesHidden && (
          <div className="w-full max-w-md border-4 border-[#3D2817] bg-black/40 rounded-xl p-4">
            <div className="h-8 rounded-lg overflow-hidden border-2 border-[#3D2817] flex bg-[#E52521]">
              <motion.div
                className="h-full bg-[#43B047]"
                initial={{ width: 0 }}
                animate={{ width: `${animatedYes}%` }}
                transition={smooth}
              />
            </div>
            <div className="flex justify-between mt-2 font-arcade text-[10px] text-white">
              <span>{animatedYes}%</span>
              <span>{animatedNo}%</span>
            </div>
          </div>
        )}

        {isRare && (
          <motion.p
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: [1, 1.08, 1], opacity: 1 }}
            className="font-arcade text-xs text-[#FBD000] drop-shadow-[2px_2px_0_#3D2817]"
          >
            ⭐ RARE EVENT CLEARED
          </motion.p>
        )}

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ ...smoothIn, delay: 0.15 }}
          className={`border-4 rounded-xl px-8 py-4 text-center relative ${
            isRare
              ? "border-[#FBD000] bg-[#FBD000]"
              : "border-[#3D2817] bg-[#FBD000]"
          }`}
        >
          {coins > 0 && (
            <motion.span
              className="absolute -top-6 right-4 text-2xl"
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: -8, opacity: [0, 1, 0] }}
              transition={{ duration: 0.7 }}
              aria-hidden
            >
              🪙
            </motion.span>
          )}
          <p className="font-display text-3xl sm:text-4xl text-[#E52521]">
            +{animatedCoins} COINS
          </p>
        </motion.div>

        <div className="mt-4 w-full flex justify-center">
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
