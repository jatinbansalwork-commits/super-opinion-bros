"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { audio } from "@/lib/audio";
import { CharacterSprite } from "@/components/ui/CharacterSprite";

const DURATION_MS = 1600;

interface PipeEntryTransitionProps {
  onComplete: () => void;
}

export function PipeEntryTransition({ onComplete }: PipeEntryTransitionProps) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    audio.duckBgm(true);
    audio.playSfx("start");
    const pipeAt = window.setTimeout(() => audio.playSfx("next"), 520);

    const timers = [
      window.setTimeout(() => setStep(1), 120),
      window.setTimeout(() => setStep(2), 280),
      window.setTimeout(() => setStep(3), 480),
      window.setTimeout(() => setStep(4), 720),
      window.setTimeout(() => setStep(5), 1100),
      window.setTimeout(() => {
        audio.duckBgm(false);
        onComplete();
      }, DURATION_MS),
    ];

    return () => {
      clearTimeout(pipeAt);
      timers.forEach(clearTimeout);
      audio.duckBgm(false);
    };
  }, [onComplete]);

  return (
    <motion.div
      className="absolute inset-0 z-50 overflow-hidden pointer-events-none"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="absolute inset-0 origin-center"
        animate={{
          scale: step >= 1 ? 1.08 : 1,
        }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute inset-0 bg-black/0"
        animate={{ backgroundColor: step >= 5 ? "rgba(0,0,0,0.72)" : "rgba(0,0,0,0)" }}
        transition={{ duration: 0.45 }}
      />

      <div className="absolute bottom-[18%] left-1/2 -translate-x-1/2 flex flex-col items-center">
        <motion.div
          className="relative z-20 mb-0"
          initial={{ opacity: 0, y: 40, scale: 0.8 }}
          animate={{
            opacity: step >= 2 ? 1 : 0,
            y: step >= 4 ? 48 : step >= 2 ? 0 : 40,
            scale: step >= 4 ? 0.6 : 1,
          }}
          transition={{ duration: 0.35, ease: "easeIn" }}
        >
          <CharacterSprite mood="happy" size="lg" />
        </motion.div>

        <motion.div
          className="relative w-20 sm:w-24 flex flex-col items-center z-10"
          initial={{ y: 120, opacity: 0 }}
          animate={{
            y: step >= 3 ? 0 : 120,
            opacity: step >= 3 ? 1 : 0,
          }}
          transition={{ type: "spring", stiffness: 180, damping: 18 }}
        >
          <div
            className="w-full h-28 sm:h-32 rounded-t-lg border-4 border-[#3D2817] bg-[#43B047]"
            style={{
              boxShadow: "inset 0 8px 0 #5cdb5f, 0 8px 0 #2D7A31",
            }}
          />
          <div className="w-[110%] h-6 -mt-1 rounded-lg border-4 border-[#3D2817] bg-[#2D9B32]" />
        </motion.div>
      </div>

      {step >= 4 && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.35, 0] }}
          transition={{ duration: 0.4 }}
        >
          <span className="text-4xl">✨</span>
        </motion.div>
      )}
    </motion.div>
  );
}
