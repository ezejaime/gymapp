import Dexie from "dexie";
import type {
  Exercise,
  ExerciseCategory,
  ExerciseType,
  SetsExerciseConfig,
  TimedExerciseConfig
} from "../types";
import { nowIso } from "../utils/dates";
import { createId } from "../utils/ids";
import { localDb } from "./localDb";

export type ExerciseFormInput = {
  routine_id: string;
  profile_id: string;
  name: string;
  short_description: string;
  full_description: string;
  video_url?: string;
  video_thumbnail_url?: string;
  category: ExerciseCategory;
  type: ExerciseType;
  sets_config?: {
    sets: number;
    reps: number;
    base_weight: number;
  };
  timed_config?: {
    work_seconds: number;
    rest_seconds: number;
    rounds: number;
  };
};

function assertExerciseInput(input: ExerciseFormInput) {
  if (!input.name.trim()) {
    throw new Error("El nombre del ejercicio es obligatorio.");
  }

  if (input.type === "sets" && !input.sets_config) {
    throw new Error("Falta la configuración por series.");
  }

  if (input.type === "timed" && !input.timed_config) {
    throw new Error("Falta la configuración por tiempo.");
  }
}

export async function getExercisesByRoutine(routineId: string) {
  return localDb.exercises
    .where("[routine_id+sort_order]")
    .between([routineId, Dexie.minKey], [routineId, Dexie.maxKey])
    .toArray();
}

export async function getExerciseById(exerciseId: string) {
  return localDb.exercises.get(exerciseId);
}

export async function getSetsExerciseConfig(exerciseId: string) {
  return localDb.sets_exercise_config.where("exercise_id").equals(exerciseId).first();
}

export async function getTimedExerciseConfig(exerciseId: string) {
  return localDb.timed_exercise_config
    .where("exercise_id")
    .equals(exerciseId)
    .first();
}

export async function getExerciseWithConfig(exerciseId: string) {
  const exercise = await getExerciseById(exerciseId);

  if (!exercise) {
    return undefined;
  }

  const sets_config =
    exercise.type === "sets" ? await getSetsExerciseConfig(exercise.id) : undefined;
  const timed_config =
    exercise.type === "timed" ? await getTimedExerciseConfig(exercise.id) : undefined;

  return {
    exercise,
    sets_config,
    timed_config
  };
}

export async function createExercise(input: ExerciseFormInput) {
  assertExerciseInput(input);

  const exercises = await getExercisesByRoutine(input.routine_id);
  const now = nowIso();
  const exercise: Exercise = {
    id: createId(),
    routine_id: input.routine_id,
    profile_id: input.profile_id,
    name: input.name.trim(),
    short_description: input.short_description.trim(),
    full_description: input.full_description.trim(),
    video_url: input.video_url?.trim() || undefined,
    video_thumbnail_url: input.video_thumbnail_url?.trim() || undefined,
    category: input.category,
    type: input.type,
    sort_order: exercises.length,
    created_at: now,
    updated_at: now
  };

  await localDb.transaction(
    "rw",
    localDb.exercises,
    localDb.sets_exercise_config,
    localDb.timed_exercise_config,
    async () => {
      await localDb.exercises.add(exercise);

      if (input.type === "sets" && input.sets_config) {
        const config: SetsExerciseConfig = {
          id: createId(),
          exercise_id: exercise.id,
          sets: input.sets_config.sets,
          reps: input.sets_config.reps,
          base_weight: input.sets_config.base_weight
        };
        await localDb.sets_exercise_config.add(config);
      }

      if (input.type === "timed" && input.timed_config) {
        const config: TimedExerciseConfig = {
          id: createId(),
          exercise_id: exercise.id,
          work_seconds: input.timed_config.work_seconds,
          rest_seconds: input.timed_config.rest_seconds,
          rounds: input.timed_config.rounds
        };
        await localDb.timed_exercise_config.add(config);
      }
    }
  );

  return exercise;
}

export async function updateExercise(exerciseId: string, input: ExerciseFormInput) {
  assertExerciseInput(input);

  const exercise = await getExerciseById(exerciseId);

  if (!exercise) {
    throw new Error("El ejercicio no existe.");
  }

  await localDb.transaction(
    "rw",
    localDb.exercises,
    localDb.sets_exercise_config,
    localDb.timed_exercise_config,
    async () => {
      await localDb.exercises.update(exerciseId, {
        name: input.name.trim(),
        short_description: input.short_description.trim(),
        full_description: input.full_description.trim(),
        video_url: input.video_url?.trim() || undefined,
        video_thumbnail_url: input.video_thumbnail_url?.trim() || undefined,
        category: input.category,
        type: input.type,
        updated_at: nowIso()
      });

      await localDb.sets_exercise_config.where("exercise_id").equals(exerciseId).delete();
      await localDb.timed_exercise_config.where("exercise_id").equals(exerciseId).delete();

      if (input.type === "sets" && input.sets_config) {
        await localDb.sets_exercise_config.add({
          id: createId(),
          exercise_id: exerciseId,
          sets: input.sets_config.sets,
          reps: input.sets_config.reps,
          base_weight: input.sets_config.base_weight
        });
      }

      if (input.type === "timed" && input.timed_config) {
        await localDb.timed_exercise_config.add({
          id: createId(),
          exercise_id: exerciseId,
          work_seconds: input.timed_config.work_seconds,
          rest_seconds: input.timed_config.rest_seconds,
          rounds: input.timed_config.rounds
        });
      }
    }
  );

  return getExerciseById(exerciseId);
}

export async function deleteExercise(exerciseId: string) {
  await localDb.transaction(
    "rw",
    localDb.exercises,
    localDb.sets_exercise_config,
    localDb.timed_exercise_config,
    async () => {
      await localDb.exercises.delete(exerciseId);
      await localDb.sets_exercise_config.where("exercise_id").equals(exerciseId).delete();
      await localDb.timed_exercise_config.where("exercise_id").equals(exerciseId).delete();
    }
  );
}

export async function reorderExercises(routineId: string, orderedExerciseIds: string[]) {
  await localDb.transaction("rw", localDb.exercises, async () => {
    await Promise.all(
      orderedExerciseIds.map((exerciseId, sortOrder) =>
        localDb.exercises.update(exerciseId, {
          sort_order: sortOrder,
          updated_at: nowIso()
        })
      )
    );
  });

  return getExercisesByRoutine(routineId);
}
