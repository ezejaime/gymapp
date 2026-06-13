import { useCallback, useEffect, useState } from "react";
import {
  getFinishedSessionsByProfile,
  getSessionCompletion
} from "../db/workoutRepository";
import { getRoutineById } from "../db/routineRepository";
import type { Routine, WorkoutSession } from "../types";

export type DayData = {
  session: WorkoutSession;
  routine: Routine;
  completion: { total: number; completed: number; percent: number };
};

export type DayMap = Map<string, DayData>;

export function useProgreso(profileId?: string) {
  const [daysByDate, setDaysByDate] = useState<DayMap>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  const refresh = useCallback(async () => {
    if (!profileId) {
      setDaysByDate(new Map());
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(undefined);

    try {
      const sessions = await getFinishedSessionsByProfile(profileId);
      const map = new Map<string, DayData>();

      for (const session of sessions) {
        const dateKey = (session.finished_at ?? session.started_at).slice(0, 10);
        const [completion, routine] = await Promise.all([
          getSessionCompletion(session.id),
          getRoutineById(session.routine_id)
        ]);

        if (routine) {
          map.set(dateKey, { session, routine, completion });
        }
      }

      setDaysByDate(map);
    } catch {
      setError("No pudimos cargar el progreso.");
    } finally {
      setIsLoading(false);
    }
  }, [profileId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    daysByDate,
    isLoading,
    error,
    refresh
  };
}
