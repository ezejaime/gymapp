import type { Exercise, SetsExerciseConfig, TimedExerciseConfig } from "./exercise";
import type { Profile } from "./profile";
import type { Routine, RoutineImage } from "./routine";
import type { WorkoutSession, WorkoutSetLog, WorkoutTimedLog } from "./workout";

export type BackupData = {
  schema_version: 1;
  exported_at: string;
  profiles: Profile[];
  routines: Routine[];
  routine_images: RoutineImage[];
  exercises: Exercise[];
  sets_exercise_config: SetsExerciseConfig[];
  timed_exercise_config: TimedExerciseConfig[];
  workout_sessions: WorkoutSession[];
  workout_set_logs: WorkoutSetLog[];
  workout_timed_logs: WorkoutTimedLog[];
};
