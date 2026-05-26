"use client";

import { motion } from "framer-motion";
import type {
  Question,
  AnswerChoice,
  GamePhase,
  RunModifiers,
  LastPredictionResult,
} from "@/lib/types";
import type { RunSurprise } from "@/lib/surpriseEngine";
import { QuestionStage } from "@/components/screens/QuestionStage";
import { ResultReveal } from "@/components/screens/ResultReveal";
import { dimLayer } from "@/lib/animations";

interface RoundViewProps {
  question: Question;
  phase: GamePhase;
  playerChoice?: AnswerChoice;
  modifiers?: RunModifiers;
  lastPrediction?: LastPredictionResult | null;
  activeSurprise?: RunSurprise | null;
  onAnswer: (choice: AnswerChoice) => void;
  onContinue: () => void;
  continuing?: boolean;
  locked: boolean;
}

const hudDim = {
  opacity: 0,
  scale: 0.95,
  filter: "blur(6px)",
};

const hudShow = {
  opacity: 1,
  scale: 1,
  filter: "blur(0px)",
};

export function RoundView({
  question,
  phase,
  playerChoice,
  modifiers = {},
  lastPrediction,
  activeSurprise = null,
  onAnswer,
  onContinue,
  continuing,
  locked,
}: RoundViewProps) {
  const isResult = phase === "result";

  return (
    <div className="relative flex h-full flex-col py-6 sm:py-8">
      <motion.header
        className="shrink-0 text-center w-full max-w-lg mx-auto px-4 z-10"
        animate={isResult ? hudDim : hudShow}
        transition={dimLayer}
        aria-hidden={isResult}
      >
        <p className="font-arcade text-sm sm:text-base text-white/90 drop-shadow-[2px_2px_0_#3D2817]">
          {question.worldName}
        </p>
        <p className="font-arcade text-xs text-white/70 mt-1">
          {question.kingdom}
        </p>
      </motion.header>

      <div className="relative flex-1 min-h-0 flex flex-col">
        <QuestionStage
          question={question}
          onAnswer={onAnswer}
          locked={locked}
          dimmed={isResult}
          modifiers={modifiers}
          activeSurprise={activeSurprise}
        />
        {isResult && playerChoice && (
          <ResultReveal
            question={question}
            playerChoice={playerChoice}
            prediction={lastPrediction}
            onContinue={onContinue}
            continuing={continuing}
          />
        )}
      </div>
    </div>
  );
}
