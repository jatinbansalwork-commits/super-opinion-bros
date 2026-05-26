"use client";

import { motion } from "framer-motion";
import { smoothIn, smoothLoop } from "@/lib/animations";

interface CharacterSpriteProps {
  mood?: "idle" | "happy" | "sad" | "walk";
  size?: "sm" | "md" | "lg";
}

const sizes = { sm: "text-4xl", md: "text-6xl", lg: "text-8xl" };

const moodMotion = {
  walk: {
    animate: { x: [0, 120] as number[] },
    transition: { ...smoothIn, duration: 2.5, repeat: 0 },
  },
  happy: {
    animate: { y: [0, -12, 0] as number[] },
    transition: { ...smoothLoop, duration: 0.6 },
  },
  sad: {
    animate: { y: [0, 4, 0] as number[] },
    transition: { ...smoothLoop, duration: 0.8 },
  },
  idle: {
    animate: { y: [0, -6, 0] as number[] },
    transition: smoothLoop,
  },
};

export function CharacterSprite({
  mood = "idle",
  size = "md",
}: CharacterSpriteProps) {
  const emoji =
    mood === "happy"
      ? "🙂"
      : mood === "sad"
        ? "😢"
        : mood === "walk"
          ? "🚶"
          : "🧑";

  const spriteMotion = moodMotion[mood];

  return (
    <motion.div
      className={`${sizes[size]} select-none`}
      animate={spriteMotion.animate}
      transition={spriteMotion.transition}
    >
      <span
        className="inline-block rounded-lg border-4 border-[#3D2817] bg-[#E52521] px-2 py-1 shadow-[4px_4px_0_#3D2817]"
        role="img"
        aria-hidden
      >
        {emoji}
      </span>
    </motion.div>
  );
}
