"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { getRunWorld } from "@/data/runWorlds";
import { ArcadeButton } from "@/components/ui/ArcadeButton";
import { springFast, smoothIn } from "@/lib/animations";

const AUTO_MS = 2000;

interface WorldClearScreenProps {
  worldId: number;
  onContinue: () => void;
}

export function WorldClearScreen({ worldId, onContinue }: WorldClearScreenProps) {
  const world = getRunWorld(worldId);
  const [ready, setReady] = useState(false);
  const advanced = useRef(false);

  const continueOnce = () => {
    if (advanced.current) return;
    advanced.current = true;
    onContinue();
  };

  useEffect(() => {
    const enable = setTimeout(() => setReady(true), AUTO_MS);
    const advance = setTimeout(continueOnce, AUTO_MS);
    return () => {
      clearTimeout(enable);
      clearTimeout(advance);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div
      className="absolute inset-0 z-35 flex items-center justify-center px-4 bg-black/35"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        initial={{ scale: 0.85, y: 24 }}
        animate={{ scale: 1, y: 0 }}
        transition={springFast}
        className="w-full max-w-md border-8 border-[#3D2817] bg-[#5C94FC] rounded-2xl p-8 text-center shadow-[8px_8px_0_#3D2817]"
      >
        <motion.span
          className="text-5xl block"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        >
          🏰
        </motion.span>
        <p className="font-arcade text-sm text-[#FBD000] mt-4">WORLD CLEAR</p>
        <h2
          className="font-display text-3xl text-white mt-2"
          style={{ textShadow: "3px 3px 0 #3D2817" }}
        >
          {world.title}
        </h2>
        <p className="font-arcade text-xs text-white/90 mt-2">Completed</p>

        {world.unlockTitle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35, ...smoothIn }}
            className="mt-6 border-4 border-[#3D2817] bg-[#FBD000] rounded-xl py-3 px-4"
          >
            <p className="font-arcade text-[10px] text-[#3D2817]">Unlocked</p>
            <p className="font-display text-xl text-[#E52521] mt-1">
              {world.unlockTitle}
            </p>
          </motion.div>
        )}

        <div className="mt-8">
          <ArcadeButton
            onClick={continueOnce}
            variant="secondary"
            disabled={!ready}
          >
            {ready ? "CONTINUE" : "..."}
          </ArcadeButton>
        </div>
      </motion.div>
    </motion.div>
  );
}
