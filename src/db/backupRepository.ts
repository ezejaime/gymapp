import { localDb } from "./localDb";
import { clearActiveProfile } from "./profileRepository";
import type { BackupData } from "../types";
import type { RoutineImage } from "../types/routine";

export const BACKUP_SCHEMA_VERSION = 1;

const BACKUP_TABLE_KEYS = [
  "profiles",
  "routines",
  "routine_images",
  "exercises",
  "sets_exercise_config",
  "timed_exercise_config",
  "workout_sessions",
  "workout_set_logs",
  "workout_timed_logs"
] as const;

type BackupTableKey = (typeof BACKUP_TABLE_KEYS)[number];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function blobToBase64(blob: Blob) {
  if (typeof blob.arrayBuffer === "function") {
    const bytes = new Uint8Array(await blob.arrayBuffer());
    let binary = "";

    for (const byte of bytes) {
      binary += String.fromCharCode(byte);
    }

    return btoa(binary);
  }

  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(new Error("No se pudo leer la imagen del backup."));
        return;
      }

      resolve(reader.result.split(",")[1] ?? "");
    };
    reader.onerror = () => reject(new Error("No se pudo leer la imagen del backup."));
    reader.readAsDataURL(blob);
  });
}

function base64ToBlob(base64: string, mimeType: string) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return new Blob([bytes], { type: mimeType });
}

async function serializeRoutineImages(
  images: RoutineImage[]
): Promise<BackupData["routine_images"]> {
  return Promise.all(
    images.map(async ({ blob, ...image }) => ({
      ...image,
      blob_base64: await blobToBase64(blob)
    }))
  );
}

function deserializeRoutineImages(
  images: BackupData["routine_images"]
): RoutineImage[] {
  return images.map(({ blob_base64, mime_type, ...image }) => ({
    ...image,
    mime_type,
    blob: base64ToBlob(blob_base64, mime_type)
  }));
}

function hasValidRoutineImages(value: unknown): value is BackupData["routine_images"] {
  return (
    Array.isArray(value) &&
    value.every(
      (image) =>
        isRecord(image) &&
        typeof image.id === "string" &&
        typeof image.mime_type === "string" &&
        typeof image.created_at === "string" &&
        typeof image.blob_base64 === "string"
    )
  );
}

export async function exportAllData(): Promise<BackupData> {
  const routineImages = await localDb.routine_images.toArray();

  return {
    schema_version: BACKUP_SCHEMA_VERSION,
    exported_at: new Date().toISOString(),
    profiles: await localDb.profiles.toArray(),
    routines: await localDb.routines.toArray(),
    routine_images: await serializeRoutineImages(routineImages),
    exercises: await localDb.exercises.toArray(),
    sets_exercise_config: await localDb.sets_exercise_config.toArray(),
    timed_exercise_config: await localDb.timed_exercise_config.toArray(),
    workout_sessions: await localDb.workout_sessions.toArray(),
    workout_set_logs: await localDb.workout_set_logs.toArray(),
    workout_timed_logs: await localDb.workout_timed_logs.toArray()
  };
}

export function validateImportedData(data: unknown): data is BackupData {
  if (!isRecord(data)) {
    return false;
  }

  if (data.schema_version !== BACKUP_SCHEMA_VERSION) {
    return false;
  }

  if (typeof data.exported_at !== "string") {
    return false;
  }

  return BACKUP_TABLE_KEYS.every((key: BackupTableKey) => {
    if (key === "routine_images") {
      return hasValidRoutineImages(data[key]);
    }

    return Array.isArray(data[key]);
  });
}

export async function importAllDataReplacingCurrentData(data: BackupData) {
  if (!validateImportedData(data)) {
    throw new Error("El archivo de backup no tiene un formato válido.");
  }

  const routineImages = deserializeRoutineImages(data.routine_images);

  await localDb.transaction("rw", localDb.tables, async () => {
    await Promise.all(localDb.tables.map((table) => table.clear()));

    await Promise.all([
      data.profiles.length ? localDb.profiles.bulkAdd(data.profiles) : undefined,
      data.routines.length ? localDb.routines.bulkAdd(data.routines) : undefined,
      routineImages.length ? localDb.routine_images.bulkAdd(routineImages) : undefined,
      data.exercises.length ? localDb.exercises.bulkAdd(data.exercises) : undefined,
      data.sets_exercise_config.length
        ? localDb.sets_exercise_config.bulkAdd(data.sets_exercise_config)
        : undefined,
      data.timed_exercise_config.length
        ? localDb.timed_exercise_config.bulkAdd(data.timed_exercise_config)
        : undefined,
      data.workout_sessions.length
        ? localDb.workout_sessions.bulkAdd(data.workout_sessions)
        : undefined,
      data.workout_set_logs.length
        ? localDb.workout_set_logs.bulkAdd(data.workout_set_logs)
        : undefined,
      data.workout_timed_logs.length
        ? localDb.workout_timed_logs.bulkAdd(data.workout_timed_logs)
        : undefined
    ]);
  });

  clearActiveProfile();
}

export async function clearAllData() {
  await localDb.transaction("rw", localDb.tables, async () => {
    await Promise.all(localDb.tables.map((table) => table.clear()));
  });

  clearActiveProfile();
}
