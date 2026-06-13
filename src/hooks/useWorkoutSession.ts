import { useCallback, useEffect, useState } from "react";
import {
  discardWorkoutSession,
  finishWorkoutSession,
  getActiveWorkoutSession,
  getWorkoutSessionById,
  getWorkoutSetLogs,
  getWorkoutTimedLogs,
  pauseWorkoutTimedLogTimer,
  resetWorkoutTimedLogTimer,
  saveWorkoutSetLog,
  saveWorkoutTimedLog,
  startWorkoutTimedLogTimer,
  startWorkoutSession
} from "../db/workoutRepository";
import type { WorkoutSession, WorkoutSetLog, WorkoutTimedLog } from "../types";

export function useActiveWorkoutSession(profileId?: string) {
  const [activeSession, setActiveSession] = useState<WorkoutSession | undefined>();
  const [isLoading, setIsLoading] = useState(true);

  const refreshActiveSession = useCallback(async () => {
    if (!profileId) {
      setActiveSession(undefined);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      setActiveSession(await getActiveWorkoutSession(profileId));
    } finally {
      setIsLoading(false);
    }
  }, [profileId]);

  const beginWorkoutSession = useCallback(
    async (routineId: string) => {
      if (!profileId) {
        throw new Error("No hay perfil activo.");
      }

      const session = await startWorkoutSession(routineId, profileId);
      await refreshActiveSession();
      return session;
    },
    [profileId, refreshActiveSession]
  );

  const discardActiveSession = useCallback(
    async (sessionId: string) => {
      await discardWorkoutSession(sessionId);
      await refreshActiveSession();
    },
    [refreshActiveSession]
  );

  useEffect(() => {
    void refreshActiveSession();
  }, [refreshActiveSession]);

  return {
    activeSession,
    isLoading,
    beginWorkoutSession,
    discardActiveSession,
    refreshActiveSession
  };
}

export function useWorkoutSession(sessionId?: string) {
  const [session, setSession] = useState<WorkoutSession | undefined>();
  const [setLogs, setSetLogs] = useState<WorkoutSetLog[]>([]);
  const [timedLogs, setTimedLogs] = useState<WorkoutTimedLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    if (!sessionId) {
      setSession(undefined);
      setSetLogs([]);
      setTimedLogs([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const [nextSession, nextSetLogs, nextTimedLogs] = await Promise.all([
        getWorkoutSessionById(sessionId),
        getWorkoutSetLogs(sessionId),
        getWorkoutTimedLogs(sessionId)
      ]);

      setSession(nextSession);
      setSetLogs(nextSetLogs);
      setTimedLogs(nextTimedLogs);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  const updateSetLog = useCallback(
    async (logId: string, updates: Pick<WorkoutSetLog, "weight" | "completed">) => {
      await saveWorkoutSetLog(logId, updates);
      await refreshSession();
    },
    [refreshSession]
  );

  const updateTimedLog = useCallback(
    async (logId: string, updates: Partial<WorkoutTimedLog>) => {
      await saveWorkoutTimedLog(logId, updates);
      await refreshSession();
    },
    [refreshSession]
  );

  const startTimedLog = useCallback(
    async (logId: string) => {
      await startWorkoutTimedLogTimer(logId);
      await refreshSession();
    },
    [refreshSession]
  );

  const pauseTimedLog = useCallback(
    async (logId: string) => {
      await pauseWorkoutTimedLogTimer(logId);
      await refreshSession();
    },
    [refreshSession]
  );

  const resetTimedLog = useCallback(
    async (logId: string) => {
      await resetWorkoutTimedLogTimer(logId);
      await refreshSession();
    },
    [refreshSession]
  );

  const finishSession = useCallback(async () => {
    if (!sessionId) {
      throw new Error("La sesión no existe.");
    }

    await finishWorkoutSession(sessionId);
    await refreshSession();
  }, [refreshSession, sessionId]);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  return {
    session,
    setLogs,
    timedLogs,
    isLoading,
    updateSetLog,
    updateTimedLog,
    startTimedLog,
    pauseTimedLog,
    resetTimedLog,
    finishSession,
    refreshSession
  };
}
