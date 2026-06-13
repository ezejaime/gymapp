import { useEffect, useState } from "react";
import {
  getSetsExerciseConfig,
  getTimedExerciseConfig
} from "../db/exerciseRepository";
import type { Exercise, SetsExerciseConfig, TimedExerciseConfig } from "../types";

export type ExerciseConfigsById = Record<
  string,
  {
    setsConfig?: SetsExerciseConfig;
    timedConfig?: TimedExerciseConfig;
  }
>;

export function useExerciseConfigs(exercises: Exercise[]) {
  const [configs, setConfigs] = useState<ExerciseConfigsById>({});

  useEffect(() => {
    let isActive = true;

    async function loadConfigs() {
      const entries = await Promise.all(
        exercises.map(async (exercise) => [
          exercise.id,
          {
            setsConfig:
              exercise.type === "sets"
                ? await getSetsExerciseConfig(exercise.id)
                : undefined,
            timedConfig:
              exercise.type === "timed"
                ? await getTimedExerciseConfig(exercise.id)
                : undefined
          }
        ] as const)
      );

      if (isActive) {
        setConfigs(Object.fromEntries(entries));
      }
    }

    void loadConfigs();

    return () => {
      isActive = false;
    };
  }, [exercises]);

  return configs;
}
