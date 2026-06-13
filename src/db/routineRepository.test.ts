import { afterEach, describe, expect, it } from "vitest";
import { createProfile } from "./profileRepository";
import {
  createRoutine,
  deleteRoutine,
  duplicateRoutine,
  getRoutineImageById,
  getRoutinesByProfile,
  updateRoutine
} from "./routineRepository";
import { localDb } from "./localDb";

async function clearDb() {
  await localDb.transaction("rw", localDb.tables, async () => {
    await Promise.all(localDb.tables.map((table) => table.clear()));
  });
  localStorage.clear();
}

afterEach(async () => {
  await clearDb();
});

describe("routineRepository", () => {
  it("crea y lista rutinas por perfil", async () => {
    const eze = await createProfile({ name: "Eze" });
    const vicky = await createProfile({ name: "Vicky" });
    const routine = await createRoutine(eze.id, {
      title: " Tren superior ",
      description: " Empuje y tirón "
    });

    await createRoutine(vicky.id, {
      title: "Piernas",
      description: ""
    });

    await expect(getRoutinesByProfile(eze.id)).resolves.toEqual([routine]);
  });

  it("rechaza rutinas sin título", async () => {
    const profile = await createProfile({ name: "Eze" });

    await expect(
      createRoutine(profile.id, { title: "   ", description: "" })
    ).rejects.toThrow("El título de la rutina es obligatorio.");
  });

  it("actualiza datos básicos de una rutina", async () => {
    const profile = await createProfile({ name: "Eze" });
    const routine = await createRoutine(profile.id, {
      title: "Vieja",
      description: "Antes"
    });

    const updated = await updateRoutine(routine.id, {
      title: "Nueva",
      description: "Después"
    });

    expect(updated).toMatchObject({
      id: routine.id,
      title: "Nueva",
      description: "Después"
    });
  });

  it("duplica una rutina básica con imagen de portada", async () => {
    const profile = await createProfile({ name: "Eze" });
    const image = new File(["imagen"], "portada.png", { type: "image/png" });
    const routine = await createRoutine(profile.id, {
      title: "Fuerza",
      description: "Base",
      coverImage: image
    });

    const duplicated = await duplicateRoutine(routine.id);

    expect(duplicated.id).not.toBe(routine.id);
    expect(duplicated.title).toBe("Fuerza copia");
    expect(duplicated.cover_image_blob_id).toBeTruthy();
    expect(duplicated.cover_image_blob_id).not.toBe(routine.cover_image_blob_id);
    await expect(
      getRoutineImageById(duplicated.cover_image_blob_id ?? "")
    ).resolves.toBeTruthy();
  });

  it("elimina una rutina y su imagen de portada", async () => {
    const profile = await createProfile({ name: "Eze" });
    const image = new File(["imagen"], "portada.png", { type: "image/png" });
    const routine = await createRoutine(profile.id, {
      title: "Fuerza",
      description: "",
      coverImage: image
    });

    await deleteRoutine(routine.id);

    await expect(getRoutinesByProfile(profile.id)).resolves.toEqual([]);
    await expect(
      getRoutineImageById(routine.cover_image_blob_id ?? "")
    ).resolves.toBeUndefined();
  });
});
