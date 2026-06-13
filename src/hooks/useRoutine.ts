import { useCallback, useEffect, useState } from "react";
import {
  getRoutineById,
  updateRoutine,
  type RoutineFormInput
} from "../db/routineRepository";
import type { Routine } from "../types";

export function useRoutine(routineId?: string) {
  const [routine, setRoutine] = useState<Routine | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  const refreshRoutine = useCallback(async () => {
    if (!routineId) {
      setRoutine(undefined);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(undefined);

    try {
      setRoutine(await getRoutineById(routineId));
    } catch {
      setError("No pudimos cargar la rutina.");
    } finally {
      setIsLoading(false);
    }
  }, [routineId]);

  const saveRoutine = useCallback(
    async (input: RoutineFormInput) => {
      if (!routineId) {
        throw new Error("La rutina no existe.");
      }

      const updatedRoutine = await updateRoutine(routineId, input);
      setRoutine(updatedRoutine);
      return updatedRoutine;
    },
    [routineId]
  );

  useEffect(() => {
    void refreshRoutine();
  }, [refreshRoutine]);

  return {
    routine,
    isLoading,
    error,
    saveRoutine,
    refreshRoutine
  };
}
