"use client";

import { motion } from "framer-motion";
import { getBossForCompletedCount } from "@/data/bosses";
import type { AnswerChoice, BossState, GamePhase } from "@/lib/types";
import { ArcadeButton } from "@/components/ui/ArcadeButton";
import { BossHealthBar } from "@/components/boss/BossHealthBar";
import { springFast, smoothIn } from "@/lib/animations";

interface BossBattleProps {
  phase: GamePhase;
  completedCount: number;
  bossState: BossState;
  lastChoice?: AnswerChoice;
  onPredict: (choice: AnswerChoice) => void;
  onDismissResult: () => void;
}

export function BossBattle({
  phase,
  completedCount,
  bossState,
  onPredict,
  onDismissResult,
}: BossBattleProps) {
  const boss = getBossForCompletedCount(completedCount);
  if (!boss) return null;

  const defeated = bossState.bossHealth <= 0;
  const round = boss.rounds[bossState.roundIndex] ?? boss.rounds[0];

  if (phase === "boss-result") {
    return (
      <motion.div
        className="absolute inset-0 z-30 flex flex-col items-center justify-center px-4 bg-black/40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          initial={{ scale: 0.5 }}
          animate={{ scale: [0.5, 1.1, 1] }}
          transition={smoothIn}
          className="text-center max-w-md border-8 border-[#3D2817] bg-[#5C94FC] rounded-2xl p-8 shadow-[8px_8px_0_#3D2817]"
        >
          {defeated ? (
            <>
              <p className="font-arcade text-sm text-[#FBD000]">VICTORY!</p>
              <p className="font-display text-4xl text-white mt-2">
                {boss.winLine}
              </p>
              <p className="font-arcade text-xs text-white mt-4">+100 COINS</p>
            </>
          ) : (
            <>
              <motion.p
                animate={{ rotate: [0, -8, 8, -5, 5, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 0.6, repeat: 2 }}
                className="text-6xl"
              >
                💥
              </motion.p>
              <p className="font-display text-2xl text-[#FBD000] mt-2">
                {boss.failLine}
              </p>
            </>
          )}
          <div className="mt-6">
            <ArcadeButton onClick={onDismissResult} variant="secondary">
              {defeated ? "CONTINUE" : "TRY AGAIN"}
            </ArcadeButton>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 px-4 py-8"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={
        bossState.shake
          ? { opacity: 1, scale: 1, x: [0, -10, 10, -8, 8, 0] }
          : { opacity: 1, scale: 1, x: 0 }
      }
      transition={bossState.shake ? { duration: 0.4 } : springFast}
    >
      <p className="font-arcade text-sm text-[#FBD000] drop-shadow-[2px_2px_0_#3D2817]">
        {boss.title}
      </p>
      <h2
        className="font-display text-2xl sm:text-4xl text-white text-center"
        style={{ textShadow: "3px 3px 0 #3D2817" }}
      >
        {boss.name}
      </h2>
      <span className="text-6xl sm:text-8xl">{boss.emoji}</span>

      <BossHealthBar health={bossState.bossHealth} />

      <div className="w-full max-w-md border-8 border-[#3D2817] bg-white/95 rounded-2xl p-6 text-center shadow-[8px_8px_0_#3D2817]">
        <p className="font-arcade text-[10px] text-[#3D2817]">
          ROUND {Math.min(bossState.roundIndex + 1, boss.rounds.length)} /{" "}
          {boss.rounds.length}
        </p>
        <p className="font-display text-xl sm:text-2xl text-[#3D2817] mt-3">
          What will the internet choose?
        </p>
        <p className="font-display text-lg text-[#3D2817] mt-2">{round.prompt}</p>

        <div className="flex flex-col sm:flex-row gap-3 mt-6 justify-center">
          <ArcadeButton variant="success" onClick={() => onPredict("A")}>
            {round.optionA}
          </ArcadeButton>
          <ArcadeButton variant="danger" onClick={() => onPredict("B")}>
            {round.optionB}
          </ArcadeButton>
        </div>
      </div>
    </motion.div>
  );
}
