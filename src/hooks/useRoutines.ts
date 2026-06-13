import { useCallback, useEffect, useState } from "react";
import {
  createRoutine,
  deleteRoutine,
  duplicateRoutine,
  getRoutinesByProfile,
  type RoutineFormInput
} from "../db/routineRepository";
import type { Routine } from "../types";

export function useRoutines(profileId?: string) {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  const refreshRoutines = useCallback(async () => {
    if (!profileId) {
      setRoutines([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(undefined);

    try {
      setRoutines(await getRoutinesByProfile(profileId));
    } catch {
      setError("No pudimos cargar las rutinas.");
    } finally {
      setIsLoading(false);
    }
  }, [profileId]);

  const addRoutine = useCallback(
    async (input: RoutineFormInput) => {
      if (!profileId) {
        throw new Error("No hay perfil activo.");
      }

      const routine = await createRoutine(profileId, input);
      await refreshRoutines();
      return routine;
    },
    [profileId, refreshRoutines]
  );

  const copyRoutine = useCallback(
    async (routineId: string) => {
      const routine = await duplicateRoutine(routineId);
      await refreshRoutines();
      return routine;
    },
    [refreshRoutines]
  );

  const removeRoutine = useCallback(
    async (routineId: string) => {
      await deleteRoutine(routineId);
      await refreshRoutines();
    },
    [refreshRoutines]
  );

  useEffect(() => {
    void refreshRoutines();
  }, [refreshRoutines]);

  return {
    routines,
    isLoading,
    error,
    addRoutine,
    duplicateRoutine: copyRoutine,
    deleteRoutine: removeRoutine,
    refreshRoutines
  };
}
