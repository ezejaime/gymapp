import { afterEach, describe, expect, it } from "vitest";
import { createProfile } from "./profileRepository";
import { createRoutine, deleteRoutine, duplicateRoutine } from "./routineRepository";
import {
  createExercise,
  deleteExercise,
  getExerciseWithConfig,
  getExercisesByRoutine,
  reorderExercises,
  updateExercise
} from "./exerciseRepository";
import { localDb } from "./localDb";

async function clearDb() {
  await localDb.transaction("rw", localDb.tables, async () => {
    await Promise.all(localDb.tables.map((table) => table.clear()));
  });
  localStorage.clear();
}

async function createRoutineFixture() {
  const profile = await createProfile({ name: "Eze" });
  const routine = await createRoutine(profile.id, {
    title: "Fuerza",
    description: ""
  });

  return { profile, routine };
}

afterEach(async () => {
  await clearDb();
});

describe("exerciseRepository", () => {
  it("crea ejercicio por series con configuración", async () => {
    const { profile, routine } = await createRoutineFixture();

    const exercise = await createExercise({
      routine_id: routine.id,
      profile_id: profile.id,
      name: "Press banca",
      short_description: "Empuje",
      full_description: "Controlar bajada.",
      category: "strength",
      type: "sets",
      sets_config: {
        sets: 4,
        reps: 8,
        base_weight: 60
      }
    });

    const result = await getExerciseWithConfig(exercise.id);

    expect(result?.exercise.name).toBe("Press banca");
    expect(result?.sets_config).toMatchObject({
      sets: 4,
      reps: 8,
      base_weight: 60
    });
  });

  it("crea ejercicio por tiempo con configuración", async () => {
    const { profile, routine } = await createRoutineFixture();

    const exercise = await createExercise({
      routine_id: routine.id,
      profile_id: profile.id,
      name: "Plancha",
      short_description: "Core",
      full_description: "",
      category: "core",
      type: "timed",
      timed_config: {
        work_seconds: 40,
        rest_seconds: 20,
        rounds: 3
      }
    });

    const result = await getExerciseWithConfig(exercise.id);

    expect(result?.timed_config).toMatchObject({
      work_seconds: 40,
      rest_seconds: 20,
      rounds: 3
    });
  });

  it("actualiza un ejercicio y cambia su tipo de configuración", async () => {
    const { profile, routine } = await createRoutineFixture();
    const exercise = await createExercise({
      routine_id: routine.id,
      profile_id: profile.id,
      name: "Sentadilla",
      short_description: "",
      full_description: "",
      category: "strength",
      type: "sets",
      sets_config: {
        sets: 3,
        reps: 10,
        base_weight: 50
      }
    });

    await updateExercise(exercise.id, {
      routine_id: routine.id,
      profile_id: profile.id,
      name: "Sentadilla isométrica",
      short_description: "",
      full_description: "",
      category: "strength",
      type: "timed",
      timed_config: {
        work_seconds: 30,
        rest_seconds: 30,
        rounds: 4
      }
    });

    const result = await getExerciseWithConfig(exercise.id);

    expect(result?.exercise.type).toBe("timed");
    expect(result?.sets_config).toBeUndefined();
    expect(result?.timed_config?.rounds).toBe(4);
  });

  it("reordena ejercicios por sort_order", async () => {
    const { profile, routine } = await createRoutineFixture();
    const first = await createExercise({
      routine_id: routine.id,
      profile_id: profile.id,
      name: "A",
      short_description: "",
      full_description: "",
      category: "warmup",
      type: "sets",
      sets_config: { sets: 1, reps: 1, base_weight: 0 }
    });
    const second = await createExercise({
      routine_id: routine.id,
      profile_id: profile.id,
      name: "B",
      short_description: "",
      full_description: "",
      category: "core",
      type: "sets",
      sets_config: { sets: 1, reps: 1, base_weight: 0 }
    });

    await reorderExercises(routine.id, [second.id, first.id]);

    await expect(getExercisesByRoutine(routine.id)).resolves.toMatchObject([
      { id: second.id, sort_order: 0 },
      { id: first.id, sort_order: 1 }
    ]);
  });

  it("elimina ejercicio y su configuración", async () => {
    const { profile, routine } = await createRoutineFixture();
    const exercise = await createExercise({
      routine_id: routine.id,
      profile_id: profile.id,
      name: "A",
      short_description: "",
      full_description: "",
      category: "warmup",
      type: "sets",
      sets_config: { sets: 1, reps: 1, base_weight: 0 }
    });

    await deleteExercise(exercise.id);

    await expect(getExerciseWithConfig(exercise.id)).resolves.toBeUndefined();
  });

  it("duplica y elimina rutina en cascada con ejercicios y configs", async () => {
    const { profile, routine } = await createRoutineFixture();
    await createExercise({
      routine_id: routine.id,
      profile_id: profile.id,
      name: "A",
      short_description: "",
      full_description: "",
      category: "warmup",
      type: "sets",
      sets_config: { sets: 2, reps: 12, base_weight: 10 }
    });

    const duplicatedRoutine = await duplicateRoutine(routine.id);
    const duplicatedExercises = await getExercisesByRoutine(duplicatedRoutine.id);

    expect(duplicatedExercises).toHaveLength(1);
    await expect(getExerciseWithConfig(duplicatedExercises[0].id)).resolves.toMatchObject({
      sets_config: {
        sets: 2,
        reps: 12,
        base_weight: 10
      }
    });

    await deleteRoutine(duplicatedRoutine.id);

    await expect(getExercisesByRoutine(duplicatedRoutine.id)).resolves.toEqual([]);
  });
});
