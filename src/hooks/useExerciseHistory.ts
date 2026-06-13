import { useCallback, useEffect, useState } from "react";
import {
  getExerciseHistory,
  type ExerciseHistoryPoint
} from "../db/workoutRepository";

export function useExerciseHistory(exerciseId?: string) {
  const [history, setHistory] = useState<ExerciseHistoryPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  const refreshHistory = useCallback(async () => {
    if (!exerciseId) {
      setHistory([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(undefined);

    try {
      setHistory(await getExerciseHistory(exerciseId));
    } catch {
      setError("No pudimos cargar el histórico.");
    } finally {
      setIsLoading(false);
    }
  }, [exerciseId]);

  useEffect(() => {
    void refreshHistory();
  }, [refreshHistory]);

  return {
    history,
    isLoading,
    error,
    refreshHistory
  };
}
