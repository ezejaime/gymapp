export type WorkoutSessionStatus = "active" | "finished" | "discarded";

export type WorkoutSession = {
  id: string;
  routine_id: string;
  profile_id: string;
  started_at: string;
  finished_at?: string;
  duration_seconds?: number;
  status: WorkoutSessionStatus;
  last_updated_at: string;
};

export type WorkoutSetLog = {
  id: string;
  session_id: string;
  exercise_id: string;
  set_number: number;
  reps: number;
  weight: number;
  completed: boolean;
  created_at: string;
  updated_at: string;
};

export type WorkoutTimedLog = {
  id: string;
  session_id: string;
  exercise_id: string;
  round_number: number;
  work_seconds: number;
  rest_seconds: number;
  timer_status: "idle" | "running" | "paused";
  timer_phase: "work" | "rest";
  timer_started_at?: string;
  timer_paused_at?: string;
  total_paused_seconds: number;
  completed: boolean;
  created_at: string;
  updated_at: string;
};
