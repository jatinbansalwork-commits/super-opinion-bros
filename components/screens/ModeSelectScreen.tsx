"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GAME_MODES } from "@/lib/gameMode";
import type { GameMode } from "@/lib/types";
import { ArcadeButton } from "@/components/ui/ArcadeButton";
import { ParallaxClouds } from "@/components/decor/TitleDecor";
import { springFast, smooth } from "@/lib/animations";

interface ModeSelectScreenProps {
  launching: boolean;
  onStart: (mode: GameMode) => void;
}

export function ModeSelectScreen({ launching, onStart }: ModeSelectScreenProps) {
  const [selected, setSelected] = useState<GameMode | null>(null);
  const selectedDef = GAME_MODES.find((m) => m.id === selected);

  return (
    <div className="relative h-full w-full overflow-hidden bg-gradient-to-b from-[#5C94FC] via-[#7EC8E3] to-[#43B047]">
      <ParallaxClouds slow />
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-[#43B047] border-t-8 border-[#2D7A31]" />

      <motion.div
        className="relative z-10 flex h-full flex-col items-center justify-center px-6 py-8"
        animate={
          launching ? { scale: 1.02, opacity: 0.3 } : { scale: 1, opacity: 1 }
        }
        transition={{ duration: 0.5 }}
      >
        <motion.h2
          initial={{ y: -16, opacity: 0 }}
          animate={{ opacity: launching ? 0 : 1, y: 0 }}
          transition={springFast}
          className="font-display text-3xl sm:text-4xl text-[#FBD000] text-center shrink-0 mb-6"
          style={{ textShadow: "3px 3px 0 #3D2817" }}
        >
          CHOOSE YOUR JOURNEY
        </motion.h2>

        <div className="w-full max-w-md flex flex-col gap-3">
          {GAME_MODES.map((mode, i) => {
            const isSelected = selected === mode.id;
            return (
              <motion.button
                key={mode.id}
                type="button"
                disabled={launching}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ ...smooth, delay: 0.06 * i }}
                onClick={() => setSelected(mode.id)}
                className={`
                  relative w-full text-left border-8 border-[#3D2817] rounded-2xl p-4 sm:p-5
                  shadow-[6px_6px_0_#3D2817] transition-colors
                  ${isSelected ? "bg-[#fffef0] -translate-y-1" : "bg-white/95"}
                `}
              >
                {mode.recommended && (
                  <span className="absolute top-2 right-2 font-arcade text-[10px] text-[#E52521]">
                    ⭐
                  </span>
                )}
                <p className="font-display text-2xl text-[#E52521]">
                  {mode.title}
                </p>
                <p className="font-arcade text-sm text-[#3D2817] mt-2">
                  {mode.line1}
                </p>
                {mode.line2 ? (
                  <p className="font-arcade text-sm text-[#3D2817]/80">
                    {mode.line2}
                  </p>
                ) : null}
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence>
          {selected && !launching && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="w-full max-w-md mt-6"
            >
              <ArcadeButton
                onClick={() => onStart(selected)}
                variant="primary"
                className="w-full"
              >
                START RUN
              </ArcadeButton>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {launching && selectedDef && (
          <motion.div
            className="absolute inset-0 z-40 flex items-center justify-center bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              initial={{ scale: 1, borderRadius: 16 }}
              animate={{ scale: 12, borderRadius: 0 }}
              transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
              className="w-full max-w-md h-32 border-8 border-[#3D2817] bg-[#FBD000] flex items-center justify-center origin-center"
            >
              <p className="font-display text-2xl text-[#E52521] opacity-0">
                {selectedDef.title}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
