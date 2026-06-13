import Dexie from "dexie";
import type {
  Exercise,
  ExerciseCategory,
  ExerciseType,
  Routine,
  RoutineImage,
  SetsExerciseConfig,
  TimedExerciseConfig
} from "../types";
import { nowIso } from "../utils/dates";
import { createId } from "../utils/ids";
import { localDb } from "./localDb";
import {
  getExercisesByRoutine,
  getSetsExerciseConfig,
  getTimedExerciseConfig
} from "./exerciseRepository";

export type RoutineFormInput = {
  title: string;
  description: string;
  coverImage?: File;
};

async function createRoutineImage(file: File) {
  const now = nowIso();
  const image: RoutineImage = {
    id: createId(),
    blob: file,
    mime_type: file.type,
    created_at: now
  };

  await localDb.routine_images.add(image);

  return image;
}

export async function getRoutinesByProfile(profileId: string) {
  return localDb.routines
    .where("[profile_id+created_at]")
    .between([profileId, Dexie.minKey], [profileId, Dexie.maxKey])
    .toArray();
}

export async function getRoutineById(routineId: string) {
  return localDb.routines.get(routineId);
}

export async function exportRoutineToJson(routineId: string) {
  const [routine, exercises] = await Promise.all([
    getRoutineById(routineId),
    getExercisesByRoutine(routineId)
  ]);

  if (!routine) {
    throw new Error("Rutina no encontrada.");
  }

  const exercisesJson: ImportedExerciseJson[] = await Promise.all(
    exercises.map(async (exercise) => {
      const base: ImportedExerciseJson = {
        name: exercise.name,
        short_description: exercise.short_description || undefined,
        full_description: exercise.full_description || undefined,
        video_url: exercise.video_url || undefined,
        video_thumbnail_url: exercise.video_thumbnail_url || undefined,
        category: exercise.category,
        type: exercise.type
      };

      if (exercise.type === "sets") {
        const config = await getSetsExerciseConfig(exercise.id);
        if (config) {
          base.sets_config = {
            sets: config.sets,
            reps: config.reps,
            base_weight: config.base_weight
          };
        }
      }

      if (exercise.type === "timed") {
        const config = await getTimedExerciseConfig(exercise.id);
        if (config) {
          base.timed_config = {
            work_seconds: config.work_seconds,
            rest_seconds: config.rest_seconds,
            rounds: config.rounds
          };
        }
      }

      return base;
    })
  );

  const result: ImportedRoutineJson = {
    title: routine.title,
    description: routine.description || undefined,
    exercises: exercisesJson.length > 0 ? exercisesJson : undefined
  };

  return result;
}

export async function getRoutineImageById(imageId: string) {
  return localDb.routine_images.get(imageId);
}

export async function createRoutine(profileId: string, input: RoutineFormInput) {
  const title = input.title.trim();

  if (!title) {
    throw new Error("El título de la rutina es obligatorio.");
  }

  const now = nowIso();
  const image = input.coverImage ? await createRoutineImage(input.coverImage) : undefined;
  const routine: Routine = {
    id: createId(),
    profile_id: profileId,
    title,
    description: input.description.trim(),
    cover_image_blob_id: image?.id,
    created_at: now,
    updated_at: now
  };

  await localDb.routines.add(routine);

  return routine;
}

export async function updateRoutine(routineId: string, input: RoutineFormInput) {
  const existingRoutine = await getRoutineById(routineId);

  if (!existingRoutine) {
    throw new Error("La rutina no existe.");
  }

  const title = input.title.trim();

  if (!title) {
    throw new Error("El título de la rutina es obligatorio.");
  }

  const image = input.coverImage ? await createRoutineImage(input.coverImage) : undefined;
  const nextCoverImageId = image?.id ?? existingRoutine.cover_image_blob_id;

  await localDb.routines.update(routineId, {
    title,
    description: input.description.trim(),
    cover_image_blob_id: nextCoverImageId,
    updated_at: nowIso()
  });

  if (image && existingRoutine.cover_image_blob_id) {
    await localDb.routine_images.delete(existingRoutine.cover_image_blob_id);
  }

  return getRoutineById(routineId);
}

export async function duplicateRoutine(routineId: string) {
  const routine = await getRoutineById(routineId);

  if (!routine) {
    throw new Error("La rutina no existe.");
  }

  const now = nowIso();
  let coverImageId: string | undefined;

  if (routine.cover_image_blob_id) {
    const image = await getRoutineImageById(routine.cover_image_blob_id);

    if (image) {
      const duplicatedImage: RoutineImage = {
        ...image,
        id: createId(),
        created_at: now
      };
      await localDb.routine_images.add(duplicatedImage);
      coverImageId = duplicatedImage.id;
    }
  }

  const duplicatedRoutine: Routine = {
    ...routine,
    id: createId(),
    title: `${routine.title} copia`,
    cover_image_blob_id: coverImageId,
    created_at: now,
    updated_at: now
  };

  await localDb.transaction(
    "rw",
    localDb.routines,
    localDb.exercises,
    localDb.sets_exercise_config,
    localDb.timed_exercise_config,
    async () => {
      await localDb.routines.add(duplicatedRoutine);

      const exercises = await localDb.exercises
        .where("routine_id")
        .equals(routine.id)
        .toArray();

      for (const exercise of exercises) {
        const duplicatedExercise: Exercise = {
          ...exercise,
          id: createId(),
          routine_id: duplicatedRoutine.id,
          created_at: now,
          updated_at: now
        };
        await localDb.exercises.add(duplicatedExercise);

        const setsConfig = await localDb.sets_exercise_config
          .where("exercise_id")
          .equals(exercise.id)
          .first();
        const timedConfig = await localDb.timed_exercise_config
          .where("exercise_id")
          .equals(exercise.id)
          .first();

        if (setsConfig) {
          const duplicatedConfig: SetsExerciseConfig = {
            ...setsConfig,
            id: createId(),
            exercise_id: duplicatedExercise.id
          };
          await localDb.sets_exercise_config.add(duplicatedConfig);
        }

        if (timedConfig) {
          const duplicatedConfig: TimedExerciseConfig = {
            ...timedConfig,
            id: createId(),
            exercise_id: duplicatedExercise.id
          };
          await localDb.timed_exercise_config.add(duplicatedConfig);
        }
      }
    }
  );

  return duplicatedRoutine;
}

export type ImportedExerciseJson = {
  name: string;
  short_description?: string;
  full_description?: string;
  video_url?: string;
  video_thumbnail_url?: string;
  category: ExerciseCategory;
  type: ExerciseType;
  sets_config?: { sets: number; reps: number; base_weight: number };
  timed_config?: {
    work_seconds: number;
    rest_seconds: number;
    rounds: number;
  };
};

export type ImportedRoutineJson = {
  title: string;
  description?: string;
  exercises?: ImportedExerciseJson[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseImportedRoutine(value: unknown): ImportedRoutineJson {
  if (!isRecord(value)) {
    throw new Error("El JSON no tiene el formato esperado.");
  }

  if (typeof value.title !== "string" || !value.title.trim()) {
    throw new Error("El JSON debe incluir un 'title'.");
  }

  const result: ImportedRoutineJson = {
    title: value.title,
    description:
      typeof value.description === "string" ? value.description : undefined
  };

  if (value.exercises !== undefined) {
    if (!Array.isArray(value.exercises)) {
      throw new Error("'exercises' debe ser un array.");
    }

    result.exercises = value.exercises.map((ex: unknown, index: number) => {
      if (!isRecord(ex)) {
        throw new Error(`El ejercicio ${index + 1} no tiene formato válido.`);
      }

      if (typeof ex.name !== "string" || !ex.name.trim()) {
        throw new Error(
          `El ejercicio ${index + 1} debe tener un 'name'.`
        );
      }

      const category = ex.category;
      if (category !== "warmup" && category !== "core" && category !== "strength") {
        throw new Error(
          `El ejercicio "${ex.name}" tiene una categoría inválida. Usá: warmup, core o strength.`
        );
      }

      const type = ex.type;
      if (type !== "sets" && type !== "timed") {
        throw new Error(
          `El ejercicio "${ex.name}" tiene un tipo inválido. Usá: sets o timed.`
        );
      }

      const parsed: ImportedExerciseJson = {
        name: ex.name,
        short_description:
          typeof ex.short_description === "string"
            ? ex.short_description
            : "",
        full_description:
          typeof ex.full_description === "string" ? ex.full_description : "",
        video_url:
          typeof ex.video_url === "string" && ex.video_url
            ? ex.video_url
            : undefined,
        video_thumbnail_url:
          typeof ex.video_thumbnail_url === "string" && ex.video_thumbnail_url
            ? ex.video_thumbnail_url
            : undefined,
        category,
        type
      };

      if (type === "sets") {
        const config = ex.sets_config;
        if (!isRecord(config)) {
          throw new Error(
            `El ejercicio "${ex.name}" es tipo sets pero falta 'sets_config'.`
          );
        }

        parsed.sets_config = {
          sets:
            typeof config.sets === "number" ? config.sets : Number(config.sets),
          reps:
            typeof config.reps === "number" ? config.reps : Number(config.reps),
          base_weight:
            typeof config.base_weight === "number"
              ? config.base_weight
              : Number(config.base_weight)
        };
      }

      if (type === "timed") {
        const config = ex.timed_config;
        if (!isRecord(config)) {
          throw new Error(
            `El ejercicio "${ex.name}" es tipo timed pero falta 'timed_config'.`
          );
        }

        parsed.timed_config = {
          work_seconds:
            typeof config.work_seconds === "number"
              ? config.work_seconds
              : Number(config.work_seconds),
          rest_seconds:
            typeof config.rest_seconds === "number"
              ? config.rest_seconds
              : Number(config.rest_seconds),
          rounds:
            typeof config.rounds === "number"
              ? config.rounds
              : Number(config.rounds)
        };
      }

      return parsed;
    });
  }

  return result;
}

function tryExtractFromBackupFormat(
  value: Record<string, unknown>
): ImportedRoutineJson | undefined {
  const routines = value.routines;
  const exercises = value.exercises;
  const setsConfigs = value.sets_exercise_config;
  const timedConfigs = value.timed_exercise_config;

  if (!Array.isArray(routines) || routines.length === 0) {
    return undefined;
  }

  const routine = routines[0];
  if (!isRecord(routine) || typeof routine.title !== "string") {
    return undefined;
  }

  const result: ImportedRoutineJson = {
    title: routine.title,
    description:
      typeof routine.description === "string" ? routine.description : undefined
  };

  const routineId = routine.id;
  if (typeof routineId === "string" && Array.isArray(exercises)) {
    const routineExercises = exercises.filter(
      (ex: unknown) =>
        isRecord(ex) && (ex as Record<string, unknown>).routine_id === routineId
    );

    if (routineExercises.length > 0) {
      result.exercises = routineExercises.map((ex: unknown) => {
        const exercise = ex as Record<string, unknown>;
        const imported: ImportedExerciseJson = {
          name: String(exercise.name ?? ""),
          short_description: String(exercise.short_description ?? ""),
          full_description: String(exercise.full_description ?? ""),
          video_url:
            typeof exercise.video_url === "string" && exercise.video_url
              ? exercise.video_url
              : undefined,
          video_thumbnail_url:
            typeof exercise.video_thumbnail_url === "string" &&
            exercise.video_thumbnail_url
              ? exercise.video_thumbnail_url
              : undefined,
          category: exercise.category as ImportedExerciseJson["category"],
          type: exercise.type as ImportedExerciseJson["type"]
        };

        const exerciseId = exercise.id;
        if (
          imported.type === "sets" &&
          typeof exerciseId === "string" &&
          Array.isArray(setsConfigs)
        ) {
          const config = setsConfigs.find(
            (c: unknown) =>
              isRecord(c) &&
              (c as Record<string, unknown>).exercise_id === exerciseId
          ) as Record<string, unknown> | undefined;

          if (config) {
            imported.sets_config = {
              sets: Number(config.sets ?? 0),
              reps: Number(config.reps ?? 0),
              base_weight: Number(config.base_weight ?? 0)
            };
          }
        }

        if (
          imported.type === "timed" &&
          typeof exerciseId === "string" &&
          Array.isArray(timedConfigs)
        ) {
          const config = timedConfigs.find(
            (c: unknown) =>
              isRecord(c) &&
              (c as Record<string, unknown>).exercise_id === exerciseId
          ) as Record<string, unknown> | undefined;

          if (config) {
            imported.timed_config = {
              work_seconds: Number(config.work_seconds ?? 0),
              rest_seconds: Number(config.rest_seconds ?? 0),
              rounds: Number(config.rounds ?? 0)
            };
          }
        }

        return imported;
      });
    }
  }

  return result;
}

export function parseRoutineImportJson(json: string): ImportedRoutineJson {
  let parsed: unknown;

  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error("El archivo no tiene formato JSON válido.");
  }

  if (!isRecord(parsed)) {
    throw new Error("El JSON debe ser un objeto.");
  }

  // Try simple format first
  if (
    typeof parsed.title === "string" &&
    parsed.title.trim()
  ) {
    return parseImportedRoutine(parsed);
  }

  // Try backup format
  const extracted = tryExtractFromBackupFormat(parsed);
  if (extracted) {
    return extracted;
  }

  throw new Error(
    "No encontramos una rutina válida en el JSON. Asegurate de que tenga al menos un 'title'."
  );
}

export async function importRoutineFromJson(
  profileId: string,
  input: ImportedRoutineJson
) {
  const now = nowIso();
  const routine: Routine = {
    id: createId(),
    profile_id: profileId,
    title: input.title.trim(),
    description: (input.description ?? "").trim(),
    created_at: now,
    updated_at: now
  };

  await localDb.transaction(
    "rw",
    localDb.routines,
    localDb.exercises,
    localDb.sets_exercise_config,
    localDb.timed_exercise_config,
    async () => {
      await localDb.routines.add(routine);

      if (input.exercises) {
        for (let index = 0; index < input.exercises.length; index++) {
          const ex = input.exercises[index];
          const exercise: Exercise = {
            id: createId(),
            routine_id: routine.id,
            profile_id: profileId,
            name: ex.name.trim(),
            short_description: (ex.short_description ?? "").trim(),
            full_description: (ex.full_description ?? "").trim(),
            video_url: ex.video_url?.trim() || undefined,
            video_thumbnail_url: ex.video_thumbnail_url?.trim() || undefined,
            category: ex.category,
            type: ex.type,
            sort_order: index,
            created_at: now,
            updated_at: now
          };
          await localDb.exercises.add(exercise);

          if (ex.type === "sets" && ex.sets_config) {
            await localDb.sets_exercise_config.add({
              id: createId(),
              exercise_id: exercise.id,
              sets: ex.sets_config.sets,
              reps: ex.sets_config.reps,
              base_weight: ex.sets_config.base_weight
            });
          }

          if (ex.type === "timed" && ex.timed_config) {
            await localDb.timed_exercise_config.add({
              id: createId(),
              exercise_id: exercise.id,
              work_seconds: ex.timed_config.work_seconds,
              rest_seconds: ex.timed_config.rest_seconds,
              rounds: ex.timed_config.rounds
            });
          }
        }
      }
    }
  );

  return routine;
}

export async function deleteRoutine(routineId: string) {
  const routine = await getRoutineById(routineId);

  if (!routine) {
    return;
  }

  await localDb.transaction(
    "rw",
    [
      localDb.routines,
      localDb.routine_images,
      localDb.exercises,
      localDb.sets_exercise_config,
      localDb.timed_exercise_config
    ],
    async () => {
      const exercises = await localDb.exercises
        .where("routine_id")
        .equals(routineId)
        .toArray();
      const exerciseIds = exercises.map((exercise) => exercise.id);

      await localDb.routines.delete(routineId);

      if (routine.cover_image_blob_id) {
        await localDb.routine_images.delete(routine.cover_image_blob_id);
      }

      await localDb.exercises.where("routine_id").equals(routineId).delete();
      await Promise.all(
        exerciseIds.flatMap((exerciseId) => [
          localDb.sets_exercise_config.where("exercise_id").equals(exerciseId).delete(),
          localDb.timed_exercise_config.where("exercise_id").equals(exerciseId).delete()
        ])
      );
    }
  );
}
