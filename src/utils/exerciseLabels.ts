import type { ExerciseCategory, ExerciseType } from "../types";

export const exerciseCategoryLabels: Record<ExerciseCategory, string> = {
  warmup: "Calentamiento",
  core: "Core",
  strength: "Fuerza"
};

export const exerciseTypeLabels: Record<ExerciseType, string> = {
  sets: "Por series",
  timed: "Por tiempo"
};

export const exerciseCategoryOrder: ExerciseCategory[] = [
  "warmup",
  "core",
  "strength"
];
