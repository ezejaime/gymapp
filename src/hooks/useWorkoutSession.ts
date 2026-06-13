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
  const [attemptedForProfile, setAttemptedForProfile] = useState<string | undefined>();

  const refreshActiveSession = useCallback(async () => {
    if (!profileId) {
      setActiveSession(undefined);
      setAttemptedForProfile(undefined);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      setActiveSession(await getActiveWorkoutSession(profileId));
      setAttemptedForProfile(profileId);
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

  // isLoading stays true when a profileId is provided but we haven't
  // completed a fetch for it yet. This prevents a race condition where
  // profileId transitions from undefined → defined, and the component
  // re-renders before the useEffect fires to fetch the session.
  const isActuallyLoading =
    isLoading || (profileId !== undefined && attemptedForProfile !== profileId);

  return {
    activeSession,
    isLoading: isActuallyLoading,
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
  const [attemptedForSession, setAttemptedForSession] = useState<string | undefined>();

  const refreshSession = useCallback(async () => {
    if (!sessionId) {
      setSession(undefined);
      setSetLogs([]);
      setTimedLogs([]);
      setAttemptedForSession(undefined);
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
      setAttemptedForSession(sessionId);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  const updateSetLog = useCallback(
    async (logId: string, updates: Pick<WorkoutSetLog, "weight" | "completed">) => {
      await saveWorkoutSetLog(logId, updates);
      setSetLogs((prev) =>
        prev.map((log) =>
          log.id === logId ? { ...log, ...updates } : log
        )
      );
    },
    []
  );

  const updateTimedLog = useCallback(
    async (logId: string, updates: Partial<WorkoutTimedLog>) => {
      await saveWorkoutTimedLog(logId, updates);
      setTimedLogs((prev) =>
        prev.map((log) =>
          log.id === logId ? { ...log, ...updates } : log
        )
      );
    },
    []
  );

  const startTimedLog = useCallback(
    async (logId: string) => {
      await startWorkoutTimedLogTimer(logId);
      setTimedLogs((prev) =>
        prev.map((log) =>
          log.id === logId
            ? {
                ...log,
                timer_status: "running" as const,
                timer_started_at: log.timer_started_at ?? new Date().toISOString(),
                timer_paused_at: undefined
              }
            : log
        )
      );
    },
    []
  );

  const pauseTimedLog = useCallback(
    async (logId: string) => {
      await pauseWorkoutTimedLogTimer(logId);
      setTimedLogs((prev) =>
        prev.map((log) =>
          log.id === logId
            ? { ...log, timer_status: "paused" as const, timer_paused_at: new Date().toISOString() }
            : log
        )
      );
    },
    []
  );

  const resetTimedLog = useCallback(
    async (logId: string) => {
      await resetWorkoutTimedLogTimer(logId);
      setTimedLogs((prev) =>
        prev.map((log) =>
          log.id === logId
            ? {
                ...log,
                timer_status: "idle" as const,
                timer_phase: "work" as const,
                timer_started_at: undefined,
                timer_paused_at: undefined,
                total_paused_seconds: 0,
                completed: false
              }
            : log
        )
      );
    },
    []
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

  // isLoading stays true when a sessionId is provided but we haven't
  // completed a fetch for it yet. This prevents a race condition where
  // sessionId transitions from undefined → defined on the render before
  // the useEffect fires.
  const isActuallyLoading =
    isLoading || (sessionId !== undefined && attemptedForSession !== sessionId);

  return {
    session,
    setLogs,
    timedLogs,
    isLoading: isActuallyLoading,
    updateSetLog,
    updateTimedLog,
    startTimedLog,
    pauseTimedLog,
    resetTimedLog,
    finishSession,
    refreshSession
  };
}
