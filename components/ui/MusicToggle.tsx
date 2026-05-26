"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { audio } from "@/lib/audio";
import { tweenFast } from "@/lib/animations";

export function MusicToggle() {
  const [musicOn, setMusicOn] = useState(true);

  useEffect(() => {
    audio.init();
    setMusicOn(audio.isMusicOn());
  }, []);

  const handleToggle = () => {
    audio.unlock();
    const next = audio.toggle();
    setMusicOn(next.music);
  };

  return (
    <motion.button
      type="button"
      onClick={handleToggle}
      whileTap={{ scale: 0.9 }}
      transition={tweenFast}
      aria-label={musicOn ? "Mute music" : "Enable music"}
      className="fixed top-4 right-4 z-50 flex items-center gap-1.5 border-4 border-[#3D2817] bg-[#FBD000] px-3 py-2 rounded-lg shadow-[0_4px_0_#C9A000] font-arcade text-[10px] sm:text-xs text-[#3D2817]"
    >
      <span className="text-base leading-none">{musicOn ? "🔊" : "🔇"}</span>
      <span>{musicOn ? "ON" : "OFF"}</span>
    </motion.button>
  );
}
