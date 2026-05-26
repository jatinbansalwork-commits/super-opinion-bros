"use client";

import { motion } from "framer-motion";
import { ArcadeButton } from "@/components/ui/ArcadeButton";
import { springFast, smooth } from "@/lib/animations";

interface RestartModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export function RestartModal({ onConfirm, onCancel }: RestartModalProps) {
  return (
    <motion.div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={smooth}
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.85, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={springFast}
        className="w-full max-w-sm border-8 border-[#3D2817] bg-[#5C94FC] rounded-2xl p-6 text-center shadow-[8px_8px_0_#3D2817]"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="font-arcade text-sm text-white drop-shadow-[2px_2px_0_#3D2817] mb-6">
          RESTART RUN?
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <ArcadeButton onClick={onConfirm} variant="primary">
            YES
          </ArcadeButton>
          <ArcadeButton onClick={onCancel} variant="secondary">
            CANCEL
          </ArcadeButton>
        </div>
      </motion.div>
    </motion.div>
  );
}
