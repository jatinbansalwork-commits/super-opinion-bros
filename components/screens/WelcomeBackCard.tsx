"use client";

import { motion } from "framer-motion";
import type { SavePreview } from "@/lib/savePreview";
import { ArcadeButton } from "@/components/ui/ArcadeButton";
import { springFast } from "@/lib/animations";

interface WelcomeBackCardProps {
  preview: SavePreview;
  onResume: () => void;
  onNewRun: () => void;
}

export function WelcomeBackCard({
  preview,
  onResume,
  onNewRun,
}: WelcomeBackCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springFast}
      className="w-full border-8 border-[#3D2817] bg-[#FBD000] rounded-2xl p-5 shadow-[6px_6px_0_#3D2817] mb-5"
    >
      <p className="font-arcade text-xs text-[#3D2817]">WELCOME BACK</p>
      <p className="font-display text-2xl text-[#E52521] mt-1">{preview.worldLabel}</p>
      <p className="font-arcade text-[10px] text-[#3D2817] mt-2">
        {preview.routeLabel}
      </p>
      <p className="font-display text-3xl text-[#3D2817] mt-1">
        {preview.progressPercent}%
      </p>
      <div className="flex flex-col sm:flex-row gap-2 mt-4">
        <ArcadeButton onClick={onResume} variant="primary" className="flex-1">
          RESUME
        </ArcadeButton>
        <ArcadeButton onClick={onNewRun} variant="secondary" className="flex-1">
          NEW RUN
        </ArcadeButton>
      </div>
    </motion.div>
  );
}
