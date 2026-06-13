import { describe, expect, it } from "vitest";
import { localDb } from "./localDb";

describe("localDb", () => {
  it("declara las tablas principales del schema local", () => {
    expect(localDb.tables.map((table) => table.name).sort()).toEqual([
      "exercises",
      "profiles",
      "routine_images",
      "routines",
      "sets_exercise_config",
      "timed_exercise_config",
      "workout_sessions",
      "workout_set_logs",
      "workout_timed_logs"
    ]);
  });
});
