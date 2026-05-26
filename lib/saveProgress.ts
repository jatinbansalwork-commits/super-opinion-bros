import { MAP_SEGMENT_SIZE } from "@/lib/constants";
import {
  questionIndexToStageIndex,
  questionIndexToWorldId,
  worldProgressToQuestionIndex,
} from "@/data/runWorlds";
import type { PersistedSave } from "@/lib/storage";
import type { PlayerAnswer } from "@/lib/types";

export interface CanonicalRunProgress {
  worldId: number;
  stageIndex: number;
  questionIndex: number;
  bossCompleted: number[];
  answeredIds: string[];
}

export function answersToIds(answers: PlayerAnswer[]): string[] {
  return answers.map((a) => a.questionId);
}

export function normalizeSaveProgress(
  saved: PersistedSave
): CanonicalRunProgress {
  const answeredIds =
    saved.answeredIds ?? answersToIds(saved.answers ?? []);
  const runLength = saved.runLength ?? 20;

  if (
    typeof saved.worldId === "number" &&
    typeof saved.stageIndex === "number"
  ) {
    const questionIndex = worldProgressToQuestionIndex(
      saved.worldId,
      saved.stageIndex
    );
    return {
      worldId: saved.worldId,
      stageIndex: saved.stageIndex,
      questionIndex,
      bossCompleted: saved.bossCompleted ?? [],
      answeredIds,
    };
  }

  const questionIndex = Math.max(
    0,
    saved.mapTargetWorld ?? saved.currentQuestion ?? 0
  );

  return {
    worldId: questionIndexToWorldId(questionIndex),
    stageIndex: questionIndexToStageIndex(questionIndex),
    questionIndex,
    bossCompleted:
      saved.bossCompleted ?? inferBossCompleted(answeredIds, runLength),
    answeredIds,
  };
}

function inferBossCompleted(answeredIds: string[], runLength: number): number[] {
  const count = answeredIds.length;
  const completed: number[] = [];
  const worldTotal = Math.ceil(runLength / MAP_SEGMENT_SIZE);
  for (let w = 1; w <= worldTotal; w++) {
    if (w * MAP_SEGMENT_SIZE <= count) {
      completed.push(w);
    }
  }
  return completed;
}

export function packSaveProgress(
  progress: CanonicalRunProgress
): Pick<
  PersistedSave,
  "worldId" | "stageIndex" | "bossCompleted" | "answeredIds" | "currentQuestion"
> {
  return {
    worldId: progress.worldId,
    stageIndex: progress.stageIndex,
    bossCompleted: progress.bossCompleted,
    answeredIds: progress.answeredIds,
    currentQuestion: progress.questionIndex,
  };
}
