import Dexie, { type Table } from "dexie";
import type {
  Exercise,
  Profile,
  Routine,
  RoutineImage,
  SetsExerciseConfig,
  TimedExerciseConfig,
  WorkoutSession,
  WorkoutSetLog,
  WorkoutTimedLog
} from "../types";

export class LocalDb extends Dexie {
  profiles!: Table<Profile, string>;
  routines!: Table<Routine, string>;
  routine_images!: Table<RoutineImage, string>;
  exercises!: Table<Exercise, string>;
  sets_exercise_config!: Table<SetsExerciseConfig, string>;
  timed_exercise_config!: Table<TimedExerciseConfig, string>;
  workout_sessions!: Table<WorkoutSession, string>;
  workout_set_logs!: Table<WorkoutSetLog, string>;
  workout_timed_logs!: Table<WorkoutTimedLog, string>;

  constructor() {
    super("gymapp_local_db");

    this.version(1).stores({
      profiles: "id, name, created_at, updated_at",
      routines: "id, profile_id, title, created_at, updated_at, [profile_id+created_at]",
      routine_images: "id, created_at",
      exercises:
        "id, routine_id, profile_id, category, type, sort_order, created_at, updated_at, [routine_id+sort_order]",
      sets_exercise_config: "id, exercise_id",
      timed_exercise_config: "id, exercise_id",
      workout_sessions:
        "id, routine_id, profile_id, started_at, finished_at, status, [profile_id+started_at], [routine_id+started_at]",
      workout_set_logs:
        "id, session_id, exercise_id, created_at, updated_at, [session_id+exercise_id], [exercise_id+created_at]",
      workout_timed_logs:
        "id, session_id, exercise_id, created_at, updated_at, [session_id+exercise_id], [exercise_id+created_at]"
    });
  }
}

export const localDb = new LocalDb();
