import Dexie from "dexie";
import type {
  Exercise,
  Routine,
  RoutineImage,
  SetsExerciseConfig,
  TimedExerciseConfig
} from "../types";
import { nowIso } from "../utils/dates";
import { createId } from "../utils/ids";
import { localDb } from "./localDb";

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
