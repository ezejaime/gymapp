import { useCallback, useEffect, useState } from "react";
import {
  getExerciseWithConfig,
  updateExercise,
  type ExerciseFormInput
} from "../db/exerciseRepository";
import type { Exercise, SetsExerciseConfig, TimedExerciseConfig } from "../types";

export type ExerciseWithConfig = {
  exercise: Exercise;
  sets_config?: SetsExerciseConfig;
  timed_config?: TimedExerciseConfig;
};

export function useExercise(exerciseId?: string) {
  const [exerciseWithConfig, setExerciseWithConfig] =
    useState<ExerciseWithConfig | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  const refreshExercise = useCallback(async () => {
    if (!exerciseId) {
      setExerciseWithConfig(undefined);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(undefined);

    try {
      setExerciseWithConfig(await getExerciseWithConfig(exerciseId));
    } catch {
      setError("No pudimos cargar el ejercicio.");
    } finally {
      setIsLoading(false);
    }
  }, [exerciseId]);

  const saveExercise = useCallback(
    async (input: ExerciseFormInput) => {
      if (!exerciseId) {
        throw new Error("El ejercicio no existe.");
      }

      await updateExercise(exerciseId, input);
      await refreshExercise();
    },
    [exerciseId, refreshExercise]
  );

  useEffect(() => {
    void refreshExercise();
  }, [refreshExercise]);

  return {
    exerciseWithConfig,
    isLoading,
    error,
    saveExercise,
    refreshExercise
  };
}
