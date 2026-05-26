"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { audio } from "@/lib/audio";
import { smooth } from "@/lib/animations";

export function AudioToast() {
  const [message, setMessage] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return audio.subscribeToast((msg) => {
      setMessage(msg);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setMessage(null), 1600);
    });
  }, []);

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          key={message}
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={smooth}
          className="fixed top-20 right-4 z-[60] border-4 border-[#3D2817] bg-[#FBD000] px-4 py-2 rounded-lg shadow-[4px_4px_0_#3D2817] font-arcade text-[10px] sm:text-xs text-[#3D2817]"
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
