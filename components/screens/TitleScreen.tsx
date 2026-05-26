"use client";

import { motion } from "framer-motion";
import {
  FloatingCoins,
  FloatingPipes,
  ParallaxClouds,
} from "@/components/decor/TitleDecor";
import { StageBlocks } from "@/components/decor/StageBlocks";
import { ArcadeButton } from "@/components/ui/ArcadeButton";
import { springFast, smooth } from "@/lib/animations";
import { usePlayerStore } from "@/store/player";

interface TitleScreenProps {
  ready: boolean;
  cloudsFrozen?: boolean;
  uiHidden?: boolean;
  onStart: () => void;
}

const buttonPulse = {
  duration: 3.5,
  ease: "easeInOut" as const,
  repeat: Infinity,
};

const titleShadow =
  "4px 4px 0 #3D2817, 6px 6px 0 rgba(0,0,0,0.2)";

export function TitleScreen({
  ready,
  cloudsFrozen = false,
  uiHidden = false,
  onStart,
}: TitleScreenProps) {
  const bestResult = usePlayerStore((s) => s.bestResult);
  return (
    <div className="relative h-full w-full overflow-hidden bg-gradient-to-b from-[#5C94FC] via-[#7EC8E3] to-[#43B047]">
      <ParallaxClouds slow frozen={cloudsFrozen} />
      {!cloudsFrozen && (
        <>
          <FloatingCoins />
          <FloatingPipes />
        </>
      )}

      <div className="absolute bottom-0 left-0 right-0 h-24 bg-[#43B047] border-t-8 border-[#2D7A31]" />
      <StageBlocks />

      <motion.div
        className="relative z-10 flex h-full flex-col items-center justify-center px-6 pb-[200px]"
        animate={{ opacity: uiHidden ? 0 : 1 }}
        transition={{ duration: 0.25 }}
      >
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={springFast}
          className="flex flex-col items-center scale-[0.9] shrink-0"
        >
          <h1
            className="font-display text-5xl sm:text-7xl md:text-8xl text-[#E52521] leading-none"
            style={{ textShadow: titleShadow }}
          >
            SUPER
          </h1>
          <h1
            className="font-display text-5xl sm:text-7xl md:text-8xl text-[#FBD000] leading-none mt-6"
            style={{ textShadow: titleShadow }}
          >
            OPINION
          </h1>
          <h1
            className="font-display text-5xl sm:text-7xl md:text-8xl text-[#43B047] leading-none mt-3"
            style={{ textShadow: titleShadow }}
          >
            BROS
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ ...smooth, delay: 0.3 }}
          className="font-arcade text-xs sm:text-sm text-white/80 max-w-xs mt-[40px] text-center shrink-0"
          style={{ textShadow: "2px 2px 0 #3D2817" }}
        >
          THE INTERNET STRIKES BACK
        </motion.p>

        {bestResult && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ ...smooth, delay: 0.42 }}
            className="font-arcade text-[10px] text-white/80 mt-3 shrink-0"
            style={{ textShadow: "2px 2px 0 #3D2817" }}
          >
            🏆 Best Result: {bestResult}
          </motion.p>
        )}

        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ ...springFast, delay: 0.5 }}
          className="mt-[80px] shrink-0 w-full max-w-xs"
        >
          <motion.div
            animate={{ scale: [1, 1.02, 1] }}
            transition={buttonPulse}
          >
            <ArcadeButton
              onClick={onStart}
              variant="primary"
              className="w-full"
              disabled={!ready || uiHidden}
            >
              START GAME
            </ArcadeButton>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
