"use client";

import { motion } from "framer-motion";
import type { InternetNewsItem } from "@/lib/surprise/internetNews";
import { smoothIn } from "@/lib/animations";

interface InternetNewsCardProps {
  news: InternetNewsItem;
}

export function InternetNewsCard({ news }: InternetNewsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={smoothIn}
      className="mt-4 w-full max-w-xs border-4 border-[#3D2817] bg-white/95 rounded-xl px-4 py-3 text-center shadow-[4px_4px_0_#3D2817]"
    >
      <p className="font-arcade text-[10px] text-[#E52521]">📰 INTERNET TODAY</p>
      <p className="font-arcade text-[10px] text-[#3D2817] mt-2 leading-relaxed">
        {news.headline}
      </p>
      <p className="font-arcade text-[9px] text-[#3D2817]/70 mt-1">{news.body}</p>
    </motion.div>
  );
}
