"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Question, AnswerChoice, RunModifiers } from "@/lib/types";
import { ArcadeButton } from "@/components/ui/ArcadeButton";
import { springFast, smoothLoop } from "@/lib/animations";

interface QuestionStageProps {
  question: Question;
  onAnswer: (choice: AnswerChoice) => void;
  locked: boolean;
  dimmed?: boolean;
  modifiers?: RunModifiers;
}

const dimAnimate = {
  opacity: 0.15,
  scale: 0.95,
  filter: "blur(6px)",
};

const brightAnimate = {
  opacity: 1,
  scale: 1,
  filter: "blur(0px)",
};

export function QuestionStage({
  question,
  onAnswer,
  locked,
  dimmed = false,
  modifiers = {},
}: QuestionStageProps) {
  const [jumping, setJumping] = useState<AnswerChoice | null>(null);
  const removed = modifiers.fiftyFiftyRemoved;
  const peek = modifiers.peekShown;
  const chaosHint = modifiers.chaosFlip;

  const handlePick = (choice: AnswerChoice) => {
    if (locked || removed === choice) return;
    setJumping(choice);
    setTimeout(() => onAnswer(choice), 400);
  };

  const showA = removed !== "A";
  const showB = removed !== "B";

  return (
    <motion.div
      className="flex flex-1 flex-col items-center justify-center gap-6 w-full max-w-xl mx-auto px-4 sm:px-8"
      animate={dimmed ? dimAnimate : brightAnimate}
      transition={{ duration: 0.45, ease: "easeOut" }}
      style={{ pointerEvents: dimmed ? "none" : "auto" }}
    >
      <p className="font-arcade text-xs sm:text-sm text-[#FBD000] text-center drop-shadow-[2px_2px_0_#3D2817]">
        WHAT WILL THE INTERNET CHOOSE?
      </p>

      <motion.div className="w-full border-8 border-[#3D2817] bg-white/95 rounded-2xl p-6 sm:p-10 shadow-[8px_8px_0_#3D2817]">
        <p className="font-display text-xl sm:text-3xl text-[#3D2817] leading-tight text-center">
          {question.title}
        </p>
        <motion.span
          className="block text-6xl sm:text-8xl mt-4 text-center"
          animate={{ scale: [1, 1.08, 1] }}
          transition={smoothLoop}
        >
          {question.emoji}
        </motion.span>
      </motion.div>

      <AnimatePresence>
        {peek && (
          <motion.p
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="font-arcade text-[10px] text-[#FBD000] border-2 border-[#3D2817] bg-[#3D2817]/80 px-3 py-1 rounded"
          >
            INTERNET WHISPER: {question.result.percentA}% vs{" "}
            {question.result.percentB}%
          </motion.p>
        )}
        {chaosHint && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-arcade text-[10px] text-[#E52521]"
          >
            CHAOS MODE — minority wins
          </motion.p>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md justify-center">
        {showA && (
          <motion.div
            animate={
              jumping === "A" ? { y: -80, scale: 1.1 } : { y: 0, scale: 1 }
            }
            transition={springFast}
          >
            <ArcadeButton
              variant="success"
              disabled={locked}
              onClick={() => handlePick("A")}
              className="w-full sm:w-auto min-w-[120px]"
            >
              {question.optionA}
            </ArcadeButton>
          </motion.div>
        )}
        {showB && (
          <motion.div
            animate={
              jumping === "B" ? { y: -80, scale: 1.1 } : { y: 0, scale: 1 }
            }
            transition={springFast}
          >
            <ArcadeButton
              variant="danger"
              disabled={locked}
              onClick={() => handlePick("B")}
              className="w-full sm:w-auto min-w-[120px]"
            >
              {question.optionB}
            </ArcadeButton>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
