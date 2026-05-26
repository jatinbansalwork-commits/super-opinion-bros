"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { getWorldTheme } from "@/data/worlds";
import { CharacterSprite } from "@/components/ui/CharacterSprite";
import { springFast, smooth } from "@/lib/animations";
import { WORLD_TRANSITION_MS } from "@/lib/constants";

interface WorldTransitionProps {
  worldIndex: number;
  onComplete: () => void;
}

export function WorldTransition({ worldIndex, onComplete }: WorldTransitionProps) {
  const theme = getWorldTheme(worldIndex);

  useEffect(() => {
    const timer = setTimeout(onComplete, WORLD_TRANSITION_MS);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-8 px-6"
      initial={{ opacity: 0, x: "8%" }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0 }}
      transition={smooth}
    >
      <motion.div
        initial={{ scale: 0.5, y: 40 }}
        animate={{ scale: 1, y: 0 }}
        transition={springFast}
        className="text-center"
      >
        <p className="font-arcade text-lg sm:text-2xl text-white drop-shadow-[2px_2px_0_#3D2817]">
          {theme.name}
        </p>
        <h2
          className="font-display text-4xl sm:text-6xl text-[#FBD000] mt-2"
          style={{ textShadow: "4px 4px 0 #3D2817" }}
        >
          {theme.kingdom}
        </h2>
      </motion.div>

      <div className="w-full max-w-md h-2 bg-black/20 rounded-full overflow-hidden border-2 border-[#3D2817]">
        <motion.div
          className="h-full bg-[#FBD000]"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: WORLD_TRANSITION_MS / 1000, ease: "easeOut" }}
        />
      </div>

      <CharacterSprite mood="walk" size="lg" />
    </motion.div>
  );
}
