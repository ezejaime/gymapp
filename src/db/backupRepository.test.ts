import { afterEach, describe, expect, it } from "vitest";
import { File } from "node:buffer";
import {
  clearAllData,
  exportAllData,
  importAllDataReplacingCurrentData,
  validateImportedData
} from "./backupRepository";
import { localDb } from "./localDb";
import { setActiveProfile } from "./profileRepository";
import { createRoutine, getRoutineImageById } from "./routineRepository";
import { createProfile } from "./profileRepository";

async function clearDb() {
  await localDb.transaction("rw", localDb.tables, async () => {
    await Promise.all(localDb.tables.map((table) => table.clear()));
  });
  localStorage.clear();
}

afterEach(async () => {
  await clearDb();
});

describe("backupRepository", () => {
  it("exporta todos los datos con metadata y blobs serializados", async () => {
    const profile = await createProfile({ name: "Eze" });
    const image = new File(["portada"], "portada.png", {
      type: "image/png"
    }) as unknown as globalThis.File;
    const routine = await createRoutine(profile.id, {
      title: "Fuerza",
      description: "Base",
      coverImage: image
    });

    const backup = await exportAllData();

    expect(backup.schema_version).toBe(1);
    expect(new Date(backup.exported_at).toString()).not.toBe("Invalid Date");
    expect(backup.profiles).toEqual([profile]);
    expect(backup.routines).toEqual([routine]);
    expect(backup.routine_images).toHaveLength(1);
    expect(backup.routine_images[0]).toMatchObject({
      id: routine.cover_image_blob_id,
      mime_type: "image/png"
    });
    expect(backup.routine_images[0].blob_base64).toBeTruthy();
  });

  it("importa un backup reemplazando todos los datos actuales", async () => {
    const originalProfile = await createProfile({ name: "Eze" });
    const image = new File(["portada"], "portada.png", {
      type: "image/png"
    }) as unknown as globalThis.File;
    const originalRoutine = await createRoutine(originalProfile.id, {
      title: "Fuerza",
      description: "",
      coverImage: image
    });
    const backup = await exportAllData();

    await clearDb();
    await createProfile({ name: "Vicky" });
    setActiveProfile(originalProfile.id);

    await importAllDataReplacingCurrentData(backup);

    await expect(localDb.profiles.toArray()).resolves.toEqual([originalProfile]);
    await expect(localDb.routines.toArray()).resolves.toEqual([originalRoutine]);
    expect(localStorage.getItem("gymapp.active_profile_id")).toBeNull();

    const restoredImage = await getRoutineImageById(
      originalRoutine.cover_image_blob_id ?? ""
    );
    expect(restoredImage?.mime_type).toBe("image/png");
    expect(restoredImage?.blob).toBeTruthy();
  });

  it("valida la estructura básica antes de importar", () => {
    expect(validateImportedData({ schema_version: 1 })).toBe(false);
    expect(
      validateImportedData({
        schema_version: 2,
        exported_at: new Date().toISOString(),
        profiles: [],
        routines: [],
        routine_images: [],
        exercises: [],
        sets_exercise_config: [],
        timed_exercise_config: [],
        workout_sessions: [],
        workout_set_logs: [],
        workout_timed_logs: []
      })
    ).toBe(false);
    expect(
      validateImportedData({
        schema_version: 1,
        exported_at: new Date().toISOString(),
        profiles: [],
        routines: [],
        routine_images: [],
        exercises: [],
        sets_exercise_config: [],
        timed_exercise_config: [],
        workout_sessions: [],
        workout_set_logs: [],
        workout_timed_logs: []
      })
    ).toBe(true);
  });

  it("limpia todas las tablas y el perfil activo", async () => {
    const profile = await createProfile({ name: "Eze" });
    setActiveProfile(profile.id);
    await createRoutine(profile.id, { title: "Fuerza", description: "" });

    await clearAllData();

    await expect(localDb.profiles.toArray()).resolves.toEqual([]);
    await expect(localDb.routines.toArray()).resolves.toEqual([]);
    expect(localStorage.getItem("gymapp.active_profile_id")).toBeNull();
  });
});
