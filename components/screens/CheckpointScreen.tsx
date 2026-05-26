"use client";

import { motion } from "framer-motion";
import {
  getInternetAgreement,
  getRunProgress,
  progressBar,
} from "@/lib/checkpoint";
import type { PlayerAnswer } from "@/lib/types";
import { ArcadeButton } from "@/components/ui/ArcadeButton";
import { springFast, smooth } from "@/lib/animations";
import { RUN_LENGTH } from "@/data/questionPool";

interface CheckpointScreenProps {
  playerAnswers: PlayerAnswer[];
  onContinue: () => void;
}

export function CheckpointScreen({
  playerAnswers,
  onContinue,
}: CheckpointScreenProps) {
  const completed = playerAnswers.length;
  const { filled, total } = getRunProgress(completed, RUN_LENGTH);
  const agreement = getInternetAgreement(playerAnswers);

  return (
    <motion.div
      className="absolute inset-0 z-30 flex items-center justify-center px-6 bg-black/20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={smooth}
    >
      <motion.div
        initial={{ scale: 0.9, y: 24 }}
        animate={{ scale: 1, y: 0 }}
        transition={springFast}
        className="w-full max-w-md border-8 border-[#3D2817] bg-[#5C94FC] rounded-2xl p-6 sm:p-8 text-center shadow-[8px_8px_0_#3D2817]"
      >
        <p className="font-arcade text-xs text-[#FBD000]">CHECKPOINT</p>
        <h2
          className="font-display text-3xl sm:text-4xl text-white mt-2"
          style={{ textShadow: "3px 3px 0 #3D2817" }}
        >
          CASTLE REACHED
        </h2>

        <div className="mt-6 space-y-2">
          <p className="font-arcade text-[10px] text-white/80">PROGRESS</p>
          <p className="font-arcade text-lg sm:text-xl text-[#FBD000] tracking-widest">
            {progressBar(filled, total)}
          </p>
        </div>

        <div className="mt-5 border-4 border-[#3D2817] bg-[#FBD000]/90 rounded-xl py-3 px-4">
          <p className="font-arcade text-[10px] text-[#3D2817]">
            INTERNET AGREEMENT
          </p>
          <p className="font-display text-4xl text-[#E52521]">{agreement}%</p>
        </div>

        <div className="mt-8">
          <ArcadeButton onClick={onContinue} variant="secondary">
            CONTINUE
          </ArcadeButton>
        </div>
      </motion.div>
    </motion.div>
  );
}
