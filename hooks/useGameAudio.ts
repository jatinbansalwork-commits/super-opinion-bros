"use client";

import { useCallback, useEffect, useRef } from "react";
import { audio } from "@/lib/audio";
import type { GamePhase } from "@/lib/types";

function runPhaseAudio(phase: GamePhase, prev: GamePhase | null): void {
  if (phase === "title" || phase === "mode-select") {
    audio.duckBgm(false);
    audio.playBgm();
    return;
  }

  if (phase === "world-map") {
    audio.duckBgm(false);
    audio.playBgm();
    if (prev === "checkpoint" || prev === "result") audio.playSfx("next");
    return;
  }

  if (phase === "question") {
    audio.duckBgm(false);
    audio.playBgm();
    return;
  }

  if (phase === "result") {
    audio.duckBgm(true);
    audio.playSfx("reveal");
    return;
  }

  if (phase === "boss" || phase === "boss-result") {
    audio.duckBgm(true);
    if (phase === "boss" && prev !== "boss") audio.playSfx("reveal");
    if (phase === "boss-result") {
      audio.playSfx(prev === "boss" ? "win" : "lose");
    }
    return;
  }

  if (phase === "world-clear") {
    audio.duckBgm(false);
    audio.playSfx("win");
    return;
  }

  if (phase === "checkpoint") {
    audio.duckBgm(false);
    audio.playBgm();
    return;
  }

  if (phase === "final") {
    audio.stopBgm();
    audio.playSfx("win");
  }
}

export function useGameAudio(phase: GamePhase, hydrated: boolean): void {
  const prevPhase = useRef<GamePhase | null>(null);

  const sync = useCallback((p: GamePhase) => {
    const prev = prevPhase.current;
    prevPhase.current = p;
    if (!audio.isUnlocked()) return;
    runPhaseAudio(p, prev);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    sync(phase);
  }, [phase, hydrated, sync]);

  useEffect(() => {
    if (!hydrated) return;
    return audio.onUnlock(() => sync(phase));
  }, [phase, hydrated, sync]);
}
