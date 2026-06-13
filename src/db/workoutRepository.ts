import Dexie from "dexie";
import { localDb } from "./localDb";

export async function getActiveWorkoutSession(profileId: string) {
  return localDb.workout_sessions
    .where("profile_id")
    .equals(profileId)
    .and((session) => session.status === "active")
    .first();
}

export async function getWorkoutSessionsByProfile(profileId: string) {
  return localDb.workout_sessions
    .where("[profile_id+started_at]")
    .between([profileId, Dexie.minKey], [profileId, Dexie.maxKey])
    .toArray();
}
