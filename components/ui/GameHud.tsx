"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { audio } from "@/lib/audio";
import { smooth, tweenFast } from "@/lib/animations";
import { RestartModal } from "@/components/ui/RestartModal";

interface GameHudProps {
  onRestart: () => void;
  onQuit: () => void;
}

export function GameHud({ onRestart, onQuit }: GameHudProps) {
  const [showRestartModal, setShowRestartModal] = useState(false);

  const handleRestartClick = () => {
    audio.unlock();
    audio.playSfx("select");
    setShowRestartModal(true);
  };

  const handleQuit = () => {
    audio.unlock();
    audio.playSfx("select");
    onQuit();
  };

  const handleConfirmRestart = () => {
    audio.playSfx("select");
    setShowRestartModal(false);
    audio.stop();
    onRestart();
  };

  return (
    <>
      <motion.div
        initial={{ x: -80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={smooth}
        className="fixed left-4 z-50 flex flex-col border-4 border-[#3D2817] bg-[#FBD000]/95 rounded-lg overflow-hidden shadow-[4px_4px_0_#3D2817] bottom-[max(24px,env(safe-area-inset-bottom))]"
      >
        <motion.button
          type="button"
          onClick={handleRestartClick}
          whileHover={{ y: -2 }}
          whileTap={{ y: 2, scale: 0.98 }}
          transition={tweenFast}
          className="px-4 py-2.5 font-arcade text-[9px] sm:text-[10px] text-[#3D2817] border-b-4 border-[#3D2817] hover:bg-[#ffe566]"
        >
          RESTART
        </motion.button>
        <motion.button
          type="button"
          onClick={handleQuit}
          whileHover={{ y: -2 }}
          whileTap={{ y: 2, scale: 0.98 }}
          transition={tweenFast}
          className="px-4 py-2.5 font-arcade text-[9px] sm:text-[10px] text-[#3D2817] hover:bg-[#ffe566]"
        >
          QUIT
        </motion.button>
      </motion.div>

      <AnimatePresence>
        {showRestartModal && (
          <RestartModal
            onConfirm={handleConfirmRestart}
            onCancel={() => {
              audio.playSfx("select");
              setShowRestartModal(false);
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
