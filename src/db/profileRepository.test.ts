import { afterEach, describe, expect, it } from "vitest";
import {
  clearActiveProfile,
  createProfile,
  getActiveProfile,
  getProfiles,
  setActiveProfile
} from "./profileRepository";
import { localDb } from "./localDb";

async function clearProfiles() {
  await localDb.profiles.clear();
  clearActiveProfile();
}

afterEach(async () => {
  await clearProfiles();
});

describe("profileRepository", () => {
  it("crea y lista perfiles locales", async () => {
    const profile = await createProfile({ name: " Eze " });

    const profiles = await getProfiles();

    expect(profile.name).toBe("Eze");
    expect(profile.id).toBeTruthy();
    expect(profile.created_at).toBeTruthy();
    expect(profile.updated_at).toBeTruthy();
    expect(profiles).toEqual([profile]);
  });

  it("rechaza perfiles sin nombre", async () => {
    await expect(createProfile({ name: "   " })).rejects.toThrow(
      "El nombre del perfil es obligatorio."
    );
  });

  it("persiste y recupera el perfil activo", async () => {
    const profile = await createProfile({ name: "Vicky" });

    setActiveProfile(profile.id);

    await expect(getActiveProfile()).resolves.toEqual(profile);
  });

  it("limpia el perfil activo", async () => {
    const profile = await createProfile({ name: "Eze" });

    setActiveProfile(profile.id);
    clearActiveProfile();

    await expect(getActiveProfile()).resolves.toBeUndefined();
  });

  it("descarta una selección activa si el perfil ya no existe", async () => {
    setActiveProfile("perfil-inexistente");

    await expect(getActiveProfile()).resolves.toBeUndefined();
    expect(localStorage.getItem("gymapp.active_profile_id")).toBeNull();
  });
});
