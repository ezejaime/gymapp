import Dexie from "dexie";
import type { WorkoutSession, WorkoutSetLog, WorkoutTimedLog } from "../types";
import { nowIso } from "../utils/dates";
import { createId } from "../utils/ids";
import {
  getExercisesByRoutine,
  getSetsExerciseConfig,
  getTimedExerciseConfig
} from "./exerciseRepository";
import { localDb } from "./localDb";

export type ExerciseHistoryPoint = {
  session_id: string;
  date: string;
  weight: number;
};

export async function startWorkoutSession(routineId: string, profileId: string) {
  const activeSession = await getActiveWorkoutSession(profileId);

  if (activeSession) {
    return activeSession;
  }

  const now = nowIso();
  const session: WorkoutSession = {
    id: createId(),
    routine_id: routineId,
    profile_id: profileId,
    started_at: now,
    status: "active",
    last_updated_at: now
  };

  const exercises = await getExercisesByRoutine(routineId);
  const setLogs: WorkoutSetLog[] = [];
  const timedLogs: WorkoutTimedLog[] = [];

  for (const exercise of exercises) {
    if (exercise.type === "sets") {
      const config = await getSetsExerciseConfig(exercise.id);

      if (config) {
        for (let setNumber = 1; setNumber <= config.sets; setNumber += 1) {
          setLogs.push({
            id: createId(),
            session_id: session.id,
            exercise_id: exercise.id,
            set_number: setNumber,
            reps: config.reps,
            weight: config.base_weight,
            completed: false,
            created_at: now,
            updated_at: now
          });
        }
      }
    }

    if (exercise.type === "timed") {
      const config = await getTimedExerciseConfig(exercise.id);

      if (config) {
        for (let roundNumber = 1; roundNumber <= config.rounds; roundNumber += 1) {
          timedLogs.push({
            id: createId(),
            session_id: session.id,
            exercise_id: exercise.id,
            round_number: roundNumber,
            work_seconds: config.work_seconds,
            rest_seconds: config.rest_seconds,
            timer_status: "idle",
            timer_phase: "work",
            total_paused_seconds: 0,
            completed: false,
            created_at: now,
            updated_at: now
          });
        }
      }
    }
  }

  await localDb.transaction(
    "rw",
    localDb.workout_sessions,
    localDb.workout_set_logs,
    localDb.workout_timed_logs,
    async () => {
      await localDb.workout_sessions.add(session);
      await localDb.workout_set_logs.bulkAdd(setLogs);
      await localDb.workout_timed_logs.bulkAdd(timedLogs);
    }
  );

  return session;
}

export async function getFinishedSessionsByProfile(profileId: string) {
  return (
    await localDb.workout_sessions
      .where("profile_id")
      .equals(profileId)
      .and((session) => session.status === "finished")
      .toArray()
  ).sort(
    (a, b) =>
      new Date(b.finished_at ?? b.started_at).getTime() -
      new Date(a.finished_at ?? a.started_at).getTime()
  );
}

export async function getSessionCompletion(sessionId: string) {
  const [setLogs, timedLogs] = await Promise.all([
    localDb.workout_set_logs.where("session_id").equals(sessionId).toArray(),
    localDb.workout_timed_logs.where("session_id").equals(sessionId).toArray()
  ]);

  const allLogs = [...setLogs, ...timedLogs];
  const total = allLogs.length;
  const completed = allLogs.filter((log) => log.completed).length;

  return {
    total,
    completed,
    percent: total > 0 ? Math.round((completed / total) * 100) : 0
  };
}

export async function getActiveWorkoutSession(profileId: string) {
  return localDb.workout_sessions
    .where("profile_id")
    .equals(profileId)
    .and((session) => session.status === "active")
    .first();
}

export async function resumeWorkoutSession(sessionId: string) {
  return localDb.workout_sessions.get(sessionId);
}

export async function discardWorkoutSession(sessionId: string) {
  await localDb.workout_sessions.update(sessionId, {
    status: "discarded",
    last_updated_at: nowIso()
  });

  return localDb.workout_sessions.get(sessionId);
}

export async function finishWorkoutSession(sessionId: string) {
  const session = await localDb.workout_sessions.get(sessionId);

  if (!session) {
    throw new Error("La sesión no existe.");
  }

  const finishedAt = nowIso();
  const durationSeconds = Math.max(
    0,
    Math.floor(
      (new Date(finishedAt).getTime() - new Date(session.started_at).getTime()) /
        1000
    )
  );

  await localDb.workout_sessions.update(sessionId, {
    finished_at: finishedAt,
    duration_seconds: durationSeconds,
    status: "finished",
    last_updated_at: finishedAt
  });

  return localDb.workout_sessions.get(sessionId);
}

export async function getWorkoutSessionById(sessionId: string) {
  return localDb.workout_sessions.get(sessionId);
}

export async function getWorkoutSetLogs(sessionId: string, exerciseId?: string) {
  if (exerciseId) {
    return localDb.workout_set_logs
      .where("[session_id+exercise_id]")
      .equals([sessionId, exerciseId])
      .sortBy("set_number");
  }

  return localDb.workout_set_logs.where("session_id").equals(sessionId).toArray();
}

export async function getWorkoutTimedLogs(sessionId: string, exerciseId?: string) {
  if (exerciseId) {
    return localDb.workout_timed_logs
      .where("[session_id+exercise_id]")
      .equals([sessionId, exerciseId])
      .sortBy("round_number");
  }

  return localDb.workout_timed_logs.where("session_id").equals(sessionId).toArray();
}

export async function saveWorkoutSetLog(
  logId: string,
  updates: Pick<WorkoutSetLog, "weight" | "completed">
) {
  const now = nowIso();
  const log = await localDb.workout_set_logs.get(logId);

  if (!log) {
    throw new Error("La serie no existe.");
  }

  await localDb.transaction(
    "rw",
    localDb.workout_set_logs,
    localDb.workout_sessions,
    async () => {
      await localDb.workout_set_logs.update(logId, {
        weight: updates.weight,
        completed: updates.completed,
        updated_at: now
      });
      await localDb.workout_sessions.update(log.session_id, {
        last_updated_at: now
      });
    }
  );
}

export async function saveWorkoutTimedLog(
  logId: string,
  updates: Partial<
    Pick<
      WorkoutTimedLog,
      | "completed"
      | "timer_status"
      | "timer_phase"
      | "timer_started_at"
      | "timer_paused_at"
      | "total_paused_seconds"
    >
  >
) {
  const now = nowIso();
  const log = await localDb.workout_timed_logs.get(logId);

  if (!log) {
    throw new Error("La ronda no existe.");
  }

  await localDb.transaction(
    "rw",
    localDb.workout_timed_logs,
    localDb.workout_sessions,
    async () => {
      await localDb.workout_timed_logs.update(logId, {
        ...updates,
        updated_at: now
      });
      await localDb.workout_sessions.update(log.session_id, {
        last_updated_at: now
      });
    }
  );
}

export async function startWorkoutTimedLogTimer(logId: string) {
  const log = await localDb.workout_timed_logs.get(logId);

  if (!log) {
    throw new Error("La ronda no existe.");
  }

  const now = nowIso();
  const pausedSeconds =
    log.timer_status === "paused" && log.timer_paused_at
      ? log.total_paused_seconds +
        Math.max(
          0,
          Math.floor(
            (new Date(now).getTime() - new Date(log.timer_paused_at).getTime()) /
              1000
          )
        )
      : log.total_paused_seconds;

  await saveWorkoutTimedLog(logId, {
    timer_status: "running",
    timer_phase: log.timer_phase,
    timer_started_at: log.timer_started_at ?? now,
    timer_paused_at: undefined,
    total_paused_seconds: pausedSeconds
  });
}

export async function pauseWorkoutTimedLogTimer(logId: string) {
  const log = await localDb.workout_timed_logs.get(logId);

  if (!log) {
    throw new Error("La ronda no existe.");
  }

  if (log.timer_status !== "running") {
    return;
  }

  await saveWorkoutTimedLog(logId, {
    timer_status: "paused",
    timer_paused_at: nowIso()
  });
}

export async function resetWorkoutTimedLogTimer(logId: string) {
  await saveWorkoutTimedLog(logId, {
    timer_status: "idle",
    timer_phase: "work",
    timer_started_at: undefined,
    timer_paused_at: undefined,
    total_paused_seconds: 0,
    completed: false
  });
}

export async function getWorkoutSessionsByProfile(profileId: string) {
  return localDb.workout_sessions
    .where("[profile_id+started_at]")
    .between([profileId, Dexie.minKey], [profileId, Dexie.maxKey])
    .toArray();
}

export async function getExerciseHistory(exerciseId: string) {
  const logs = await localDb.workout_set_logs
    .where("exercise_id")
    .equals(exerciseId)
    .and((log) => log.completed)
    .toArray();

  if (logs.length === 0) {
    return [];
  }

  const sessionIds = Array.from(new Set(logs.map((log) => log.session_id)));
  const sessions = await localDb.workout_sessions.bulkGet(sessionIds);
  const finishedSessions = new Map(
    sessions
      .filter((session): session is WorkoutSession => Boolean(session))
      .filter((session) => session.status === "finished")
      .map((session) => [session.id, session])
  );
  const maxWeightBySession = new Map<string, number>();

  for (const log of logs) {
    if (!finishedSessions.has(log.session_id)) {
      continue;
    }

    const currentMax = maxWeightBySession.get(log.session_id);

    if (currentMax === undefined || log.weight > currentMax) {
      maxWeightBySession.set(log.session_id, log.weight);
    }
  }

  return Array.from(maxWeightBySession.entries())
    .map(([sessionId, weight]): ExerciseHistoryPoint => {
      const session = finishedSessions.get(sessionId);

      return {
        session_id: sessionId,
        date: session?.finished_at ?? session?.started_at ?? "",
        weight
      };
    })
    .sort((first, second) => first.date.localeCompare(second.date));
}
