import { useCallback, useEffect, useState } from "react";
import {
  createExercise,
  deleteExercise,
  getExercisesByRoutine,
  reorderExercises,
  updateExercise,
  type ExerciseFormInput
} from "../db/exerciseRepository";
import type { Exercise } from "../types";

export function useExercises(routineId?: string) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  const refreshExercises = useCallback(async () => {
    if (!routineId) {
      setExercises([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(undefined);

    try {
      setExercises(await getExercisesByRoutine(routineId));
    } catch {
      setError("No pudimos cargar los ejercicios.");
    } finally {
      setIsLoading(false);
    }
  }, [routineId]);

  const addExercise = useCallback(
    async (input: ExerciseFormInput) => {
      const exercise = await createExercise(input);
      await refreshExercises();
      return exercise;
    },
    [refreshExercises]
  );

  const saveExercise = useCallback(
    async (exerciseId: string, input: ExerciseFormInput) => {
      const exercise = await updateExercise(exerciseId, input);
      await refreshExercises();
      return exercise;
    },
    [refreshExercises]
  );

  const removeExercise = useCallback(
    async (exerciseId: string) => {
      await deleteExercise(exerciseId);
      await refreshExercises();
    },
    [refreshExercises]
  );

  const moveExercise = useCallback(
    async (exerciseId: string, direction: "up" | "down") => {
      if (!routineId) {
        return;
      }

      const currentIndex = exercises.findIndex((exercise) => exercise.id === exerciseId);
      const nextIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

      if (currentIndex < 0 || nextIndex < 0 || nextIndex >= exercises.length) {
        return;
      }

      const nextExercises = [...exercises];
      const [exercise] = nextExercises.splice(currentIndex, 1);
      nextExercises.splice(nextIndex, 0, exercise);

      setExercises(nextExercises);
      await reorderExercises(
        routineId,
        nextExercises.map((nextExercise) => nextExercise.id)
      );
      await refreshExercises();
    },
    [exercises, refreshExercises, routineId]
  );

  useEffect(() => {
    void refreshExercises();
  }, [refreshExercises]);

  return {
    exercises,
    isLoading,
    error,
    addExercise,
    saveExercise,
    deleteExercise: removeExercise,
    moveExercise,
    refreshExercises
  };
}
