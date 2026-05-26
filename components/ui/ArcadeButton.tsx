"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { audio } from "@/lib/audio";
import { tweenFast } from "@/lib/animations";

interface ArcadeButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger" | "success";
  disabled?: boolean;
  className?: string;
}

const variants = {
  primary: "bg-[#E52521] border-[#8B0000] text-white shadow-[0_6px_0_#8B0000]",
  secondary:
    "bg-[#FBD000] border-[#C9A000] text-[#3D2817] shadow-[0_6px_0_#C9A000]",
  danger: "bg-[#6B2D5C] border-[#3D1A35] text-white shadow-[0_6px_0_#3D1A35]",
  success:
    "bg-[#43B047] border-[#2D7A31] text-white shadow-[0_6px_0_#2D7A31]",
};

export function ArcadeButton({
  children,
  onClick,
  variant = "primary",
  disabled = false,
  className = "",
}: ArcadeButtonProps) {
  const handleClick = () => {
    if (disabled) return;
    audio.unlock();
    audio.playSfx("select");
    onClick?.();
  };

  return (
    <motion.button
      type="button"
      disabled={disabled}
      onClick={handleClick}
      whileHover={disabled ? undefined : { y: -4, scale: 1.03 }}
      whileTap={disabled ? undefined : { y: 4, scale: 0.97 }}
      transition={tweenFast}
      className={`
        relative min-h-[56px] min-w-[140px] px-8 py-4
        font-arcade text-sm sm:text-base uppercase tracking-wider
        border-4 rounded-lg select-none
        transition-colors disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${className}
      `}
    >
      {children}
    </motion.button>
  );
}
