export type ExerciseCategory = "warmup" | "core" | "strength";

export type ExerciseType = "sets" | "timed";

export type Exercise = {
  id: string;
  routine_id: string;
  profile_id: string;
  name: string;
  short_description: string;
  full_description: string;
  video_url?: string;
  video_thumbnail_url?: string;
  category: ExerciseCategory;
  type: ExerciseType;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type SetsExerciseConfig = {
  id: string;
  exercise_id: string;
  sets: number;
  reps: number;
  base_weight: number;
};

export type TimedExerciseConfig = {
  id: string;
  exercise_id: string;
  work_seconds: number;
  rest_seconds: number;
  rounds: number;
};
