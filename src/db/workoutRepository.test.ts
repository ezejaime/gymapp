import { afterEach, describe, expect, it } from "vitest";
import { createExercise } from "./exerciseRepository";
import { localDb } from "./localDb";
import { createProfile } from "./profileRepository";
import { createRoutine } from "./routineRepository";
import {
  discardWorkoutSession,
  finishWorkoutSession,
  getActiveWorkoutSession,
  getExerciseHistory,
  getFinishedSessionsByProfile,
  getSessionCompletion,
  getWorkoutSetLogs,
  getWorkoutTimedLogs,
  pauseWorkoutTimedLogTimer,
  resetWorkoutTimedLogTimer,
  saveWorkoutSetLog,
  saveWorkoutTimedLog,
  startWorkoutTimedLogTimer,
  startWorkoutSession
} from "./workoutRepository";

async function clearDb() {
  await localDb.transaction("rw", localDb.tables, async () => {
    await Promise.all(localDb.tables.map((table) => table.clear()));
  });
  localStorage.clear();
}

async function createWorkoutFixture() {
  const profile = await createProfile({ name: "Eze" });
  const routine = await createRoutine(profile.id, {
    title: "Fuerza",
    description: ""
  });
  const setsExercise = await createExercise({
    routine_id: routine.id,
    profile_id: profile.id,
    name: "Press",
    short_description: "",
    full_description: "",
    category: "strength",
    type: "sets",
    sets_config: {
      sets: 2,
      reps: 8,
      base_weight: 40
    }
  });
  const timedExercise = await createExercise({
    routine_id: routine.id,
    profile_id: profile.id,
    name: "Plancha",
    short_description: "",
    full_description: "",
    category: "core",
    type: "timed",
    timed_config: {
      work_seconds: 30,
      rest_seconds: 15,
      rounds: 2
    }
  });

  return { profile, routine, setsExercise, timedExercise };
}

afterEach(async () => {
  await clearDb();
});

describe("workoutRepository", () => {
  it("inicia sesión activa y crea logs iniciales", async () => {
    const { profile, routine, setsExercise, timedExercise } =
      await createWorkoutFixture();

    const session = await startWorkoutSession(routine.id, profile.id);

    expect(session.status).toBe("active");
    await expect(getActiveWorkoutSession(profile.id)).resolves.toEqual(session);
    await expect(getWorkoutSetLogs(session.id, setsExercise.id)).resolves.toHaveLength(2);
    await expect(
      getWorkoutTimedLogs(session.id, timedExercise.id)
    ).resolves.toHaveLength(2);
  });

  it("reusa una sesión activa existente del perfil", async () => {
    const { profile, routine } = await createWorkoutFixture();

    const firstSession = await startWorkoutSession(routine.id, profile.id);
    const secondSession = await startWorkoutSession(routine.id, profile.id);

    expect(secondSession.id).toBe(firstSession.id);
  });

  it("guarda progreso incremental de series y actualiza la sesión", async () => {
    const { profile, routine, setsExercise } = await createWorkoutFixture();
    const session = await startWorkoutSession(routine.id, profile.id);
    const [log] = await getWorkoutSetLogs(session.id, setsExercise.id);

    await saveWorkoutSetLog(log.id, {
      weight: 45,
      completed: true
    });

    const [updatedLog] = await getWorkoutSetLogs(session.id, setsExercise.id);
    const updatedSession = await getActiveWorkoutSession(profile.id);

    expect(updatedLog).toMatchObject({
      weight: 45,
      completed: true
    });
    expect(updatedSession?.last_updated_at).not.toBe(session.last_updated_at);
  });

  it("guarda progreso incremental de rondas", async () => {
    const { profile, routine, timedExercise } = await createWorkoutFixture();
    const session = await startWorkoutSession(routine.id, profile.id);
    const [log] = await getWorkoutTimedLogs(session.id, timedExercise.id);

    await saveWorkoutTimedLog(log.id, {
      completed: true
    });

    const [updatedLog] = await getWorkoutTimedLogs(session.id, timedExercise.id);

    expect(updatedLog.completed).toBe(true);
  });

  it("descarta la sesión activa", async () => {
    const { profile, routine } = await createWorkoutFixture();
    const session = await startWorkoutSession(routine.id, profile.id);

    await discardWorkoutSession(session.id);

    await expect(getActiveWorkoutSession(profile.id)).resolves.toBeUndefined();
  });

  it("persiste estado de timer por timestamps", async () => {
    const { profile, routine, timedExercise } = await createWorkoutFixture();
    const session = await startWorkoutSession(routine.id, profile.id);
    const [log] = await getWorkoutTimedLogs(session.id, timedExercise.id);

    await startWorkoutTimedLogTimer(log.id);

    const [runningLog] = await getWorkoutTimedLogs(session.id, timedExercise.id);
    expect(runningLog.timer_status).toBe("running");
    expect(runningLog.timer_started_at).toBeTruthy();

    await pauseWorkoutTimedLogTimer(log.id);

    const [pausedLog] = await getWorkoutTimedLogs(session.id, timedExercise.id);
    expect(pausedLog.timer_status).toBe("paused");
    expect(pausedLog.timer_paused_at).toBeTruthy();

    await startWorkoutTimedLogTimer(log.id);

    const [resumedLog] = await getWorkoutTimedLogs(session.id, timedExercise.id);
    expect(resumedLog.timer_status).toBe("running");
    expect(resumedLog.timer_started_at).toBe(runningLog.timer_started_at);
    expect(resumedLog.timer_paused_at).toBeUndefined();
  });

  it("reinicia timer de una ronda", async () => {
    const { profile, routine, timedExercise } = await createWorkoutFixture();
    const session = await startWorkoutSession(routine.id, profile.id);
    const [log] = await getWorkoutTimedLogs(session.id, timedExercise.id);

    await startWorkoutTimedLogTimer(log.id);
    await saveWorkoutTimedLog(log.id, { completed: true });
    await resetWorkoutTimedLogTimer(log.id);

    const [resetLog] = await getWorkoutTimedLogs(session.id, timedExercise.id);
    expect(resetLog).toMatchObject({
      timer_status: "idle",
      timer_phase: "work",
      total_paused_seconds: 0,
      completed: false
    });
    expect(resetLog.timer_started_at).toBeUndefined();
    expect(resetLog.timer_paused_at).toBeUndefined();
  });

  it("finaliza sesión activa con fecha de fin y duración", async () => {
    const { profile, routine } = await createWorkoutFixture();
    const session = await startWorkoutSession(routine.id, profile.id);

    const finishedSession = await finishWorkoutSession(session.id);

    expect(finishedSession).toMatchObject({
      id: session.id,
      status: "finished"
    });
    expect(finishedSession?.finished_at).toBeTruthy();
    expect(finishedSession?.duration_seconds).toBeGreaterThanOrEqual(0);
    await expect(getActiveWorkoutSession(profile.id)).resolves.toBeUndefined();
  });

  it("calcula histórico usando el mayor peso completado por sesión finalizada", async () => {
    const { profile, routine, setsExercise } = await createWorkoutFixture();
    const firstSession = await startWorkoutSession(routine.id, profile.id);
    const firstLogs = await getWorkoutSetLogs(firstSession.id, setsExercise.id);

    await saveWorkoutSetLog(firstLogs[0].id, {
      weight: 40,
      completed: true
    });
    await saveWorkoutSetLog(firstLogs[1].id, {
      weight: 45,
      completed: true
    });
    await finishWorkoutSession(firstSession.id);

    const secondSession = await startWorkoutSession(routine.id, profile.id);
    const secondLogs = await getWorkoutSetLogs(secondSession.id, setsExercise.id);

    await saveWorkoutSetLog(secondLogs[0].id, {
      weight: 50,
      completed: false
    });
    await saveWorkoutSetLog(secondLogs[1].id, {
      weight: 47.5,
      completed: true
    });
    await finishWorkoutSession(secondSession.id);

    const activeSession = await startWorkoutSession(routine.id, profile.id);
    const activeLogs = await getWorkoutSetLogs(activeSession.id, setsExercise.id);

    await saveWorkoutSetLog(activeLogs[0].id, {
      weight: 100,
      completed: true
    });

    await expect(getExerciseHistory(setsExercise.id)).resolves.toMatchObject([
      {
        session_id: firstSession.id,
        weight: 45
      },
      {
        session_id: secondSession.id,
        weight: 47.5
      }
    ]);
  });

  it("devuelve sesiones finalizadas de un perfil", async () => {
    const { profile, routine } = await createWorkoutFixture();
    const session = await startWorkoutSession(routine.id, profile.id);
    
    await finishWorkoutSession(session.id);
    
    const finished = await getFinishedSessionsByProfile(profile.id);
    
    expect(finished).toHaveLength(1);
    expect(finished[0].id).toBe(session.id);
    expect(finished[0].status).toBe("finished");
  });

  it("calcula el porcentaje de completitud de una sesión", async () => {
    const { profile, routine, setsExercise, timedExercise } =
      await createWorkoutFixture();
    const session = await startWorkoutSession(routine.id, profile.id);
    const setLogs = await getWorkoutSetLogs(session.id, setsExercise.id);
    const timedLogs = await getWorkoutTimedLogs(session.id, timedExercise.id);
    const totalLogs = setLogs.length + timedLogs.length; // 2 sets + 2 rounds = 4

    expect(totalLogs).toBe(4);

    // Complete one set (25%)
    await saveWorkoutSetLog(setLogs[0].id, { weight: 40, completed: true });
    let completion = await getSessionCompletion(session.id);
    expect(completion).toMatchObject({ total: 4, completed: 1, percent: 25 });

    // Complete all (100%)
    await saveWorkoutSetLog(setLogs[1].id, { weight: 45, completed: true });
    await saveWorkoutTimedLog(timedLogs[0].id, { completed: true });
    await saveWorkoutTimedLog(timedLogs[1].id, { completed: true });
    completion = await getSessionCompletion(session.id);
    expect(completion).toMatchObject({ total: 4, completed: 4, percent: 100 });
  });
});
