"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GAME_MODES, starsDisplay } from "@/lib/gameMode";
import type { SavePreview } from "@/lib/savePreview";
import type { GameMode } from "@/lib/types";
import { WelcomeBackCard } from "@/components/screens/WelcomeBackCard";
import { ArcadeButton } from "@/components/ui/ArcadeButton";
import { ParallaxClouds } from "@/components/decor/TitleDecor";
import { springFast, smooth } from "@/lib/animations";

interface ModeSelectScreenProps {
  savePreview: SavePreview | null;
  launching: boolean;
  onResume: () => void;
  onNewRun: () => void;
  onLaunch: (mode: GameMode) => void;
}

export function ModeSelectScreen({
  savePreview,
  launching,
  onResume,
  onNewRun,
  onLaunch,
}: ModeSelectScreenProps) {
  const [selected, setSelected] = useState<GameMode | null>(null);
  const [hideWelcome, setHideWelcome] = useState(false);

  const selectedDef = GAME_MODES.find((m) => m.id === selected);

  const handleNewRun = () => {
    setHideWelcome(true);
    onNewRun();
  };

  const handleContinue = () => {
    if (selected) onLaunch(selected);
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-gradient-to-b from-[#5C94FC] via-[#7EC8E3] to-[#43B047]">
      <ParallaxClouds slow />
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-[#43B047] border-t-8 border-[#2D7A31]" />

      <motion.div
        className="relative z-10 flex h-full flex-col items-center px-6 py-6 overflow-y-auto"
        animate={
          launching
            ? { scale: 1.02, opacity: 0.3 }
            : { scale: 1, opacity: 1 }
        }
        transition={{ duration: 0.5 }}
      >
        <motion.h2
          initial={{ y: -16, opacity: 0 }}
          animate={{ opacity: launching ? 0 : 1, y: 0 }}
          transition={springFast}
          className="font-display text-3xl sm:text-4xl text-[#FBD000] text-center shrink-0"
          style={{ textShadow: "3px 3px 0 #3D2817" }}
        >
          CHOOSE YOUR JOURNEY
        </motion.h2>

        <div className="w-full max-w-md mt-5 flex-1 flex flex-col min-h-0">
          <AnimatePresence>
            {savePreview && !hideWelcome && !launching && (
              <WelcomeBackCard
                preview={savePreview}
                onResume={onResume}
                onNewRun={handleNewRun}
              />
            )}
          </AnimatePresence>

          <div className="flex flex-col gap-3">
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
                    shadow-[6px_6px_0_#3D2817] transition-colors overflow-hidden
                    ${isSelected ? "bg-[#fffef0] -translate-y-1 scale-[1.02]" : "bg-white/95"}
                  `}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="mode-shine"
                      className="absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-[#FBD000]/20 pointer-events-none"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    />
                  )}
                  {mode.recommended && (
                    <span className="absolute top-2 right-2 font-arcade text-[8px] text-[#E52521] bg-[#FBD000] border-2 border-[#3D2817] px-2 py-0.5 rounded">
                      RECOMMENDED
                    </span>
                  )}
                  <p className="font-display text-2xl text-[#E52521] relative z-10">
                    {mode.title}
                  </p>
                  <p className="font-arcade text-sm text-[#3D2817] mt-1 relative z-10">
                    {mode.subtitle}
                  </p>
                  {mode.lines.map((line) => (
                    <p
                      key={line}
                      className="font-arcade text-[10px] text-[#3D2817]/75 relative z-10"
                    >
                      {line}
                    </p>
                  ))}
                  <p className="font-arcade text-xs text-[#FBD000] mt-2 drop-shadow-[1px_1px_0_#3D2817] relative z-10">
                    {starsDisplay(mode.stars)}
                  </p>
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
                className="mt-5 shrink-0 pb-4"
              >
                <ArcadeButton
                  onClick={handleContinue}
                  variant="primary"
                  className="w-full"
                >
                  CONTINUE
                </ArcadeButton>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
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
