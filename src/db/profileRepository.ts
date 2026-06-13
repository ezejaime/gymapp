import { localDb } from "./localDb";
import type { Profile } from "../types";
import { nowIso } from "../utils/dates";
import { createId } from "../utils/ids";

const ACTIVE_PROFILE_STORAGE_KEY = "gymapp.active_profile_id";

export type CreateProfileInput = {
  name: string;
};

export async function createProfile(input: CreateProfileInput) {
  const name = input.name.trim();

  if (!name) {
    throw new Error("El nombre del perfil es obligatorio.");
  }

  const now = nowIso();
  const profile: Profile = {
    id: createId(),
    name,
    created_at: now,
    updated_at: now
  };

  await localDb.profiles.add(profile);

  return profile;
}

export async function getProfiles() {
  return localDb.profiles.orderBy("created_at").toArray();
}

export async function getProfileById(profileId: string) {
  return localDb.profiles.get(profileId);
}

export function setActiveProfile(profileId: string) {
  localStorage.setItem(ACTIVE_PROFILE_STORAGE_KEY, profileId);
}

export async function getActiveProfile() {
  const profileId = localStorage.getItem(ACTIVE_PROFILE_STORAGE_KEY);

  if (!profileId) {
    return undefined;
  }

  const profile = await getProfileById(profileId);

  if (!profile) {
    clearActiveProfile();
  }

  return profile;
}

export function clearActiveProfile() {
  localStorage.removeItem(ACTIVE_PROFILE_STORAGE_KEY);
}
