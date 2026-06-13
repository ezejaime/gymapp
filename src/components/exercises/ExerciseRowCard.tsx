import { useNavigate } from "react-router";
import type { Exercise, SetsExerciseConfig, TimedExerciseConfig } from "../../types";
import { exerciseTypeLabels } from "../../utils/exerciseLabels";
import { Button } from "../ui/Button";

type ExerciseRowCardProps = {
  exercise: Exercise;
  setsConfig?: SetsExerciseConfig;
  timedConfig?: TimedExerciseConfig;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onDelete: (exercise: Exercise) => void;
  onMove: (exerciseId: string, direction: "up" | "down") => void;
};

function formatSummary(
  exercise: Exercise,
  setsConfig?: SetsExerciseConfig,
  timedConfig?: TimedExerciseConfig
) {
  if (exercise.type === "sets" && setsConfig) {
    return `${setsConfig.sets} series · ${setsConfig.reps} reps · ${setsConfig.base_weight} kg`;
  }

  if (exercise.type === "timed" && timedConfig) {
    return `${timedConfig.rounds} rondas · ${timedConfig.work_seconds}s trabajo · ${timedConfig.rest_seconds}s descanso`;
  }

  return "Sin configuración";
}

export function ExerciseRowCard({
  exercise,
  setsConfig,
  timedConfig,
  canMoveUp,
  canMoveDown,
  onDelete,
  onMove
}: ExerciseRowCardProps) {
  const navigate = useNavigate();

  return (
    <article className="grid gap-3 rounded-lg border border-neutral-200 p-3">
      <div className="flex gap-3">
        <button
          className="h-20 w-24 shrink-0 overflow-hidden rounded-md border border-neutral-200 bg-neutral-100"
          onClick={() => void navigate(`/ejercicios/${exercise.id}`)}
          type="button"
        >
          {exercise.video_thumbnail_url ? (
            <img
              alt=""
              className="h-full w-full object-cover"
              src={exercise.video_thumbnail_url}
            />
          ) : (
            <span className="flex h-full items-center justify-center text-2xl text-neutral-300">
              +
            </span>
          )}
        </button>

        <div className="min-w-0 flex-1">
          <h3 className="break-words text-lg font-semibold">{exercise.name}</h3>
          <p className="text-sm font-medium text-neutral-600">
            {exerciseTypeLabels[exercise.type]}
          </p>
          <p className="line-clamp-2 text-sm text-neutral-700">
            {exercise.short_description || "Sin descripción breve"}
          </p>
          <p className="mt-1 text-sm text-neutral-600">
            {formatSummary(exercise, setsConfig, timedConfig)}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          aria-label="Subir"
          disabled={!canMoveUp}
          onClick={() => onMove(exercise.id, "up")}
          variant="secondary"
        >
          <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="M12 19V5m0 0l-7 7m7-7l7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Button>
        <Button
          aria-label="Bajar"
          disabled={!canMoveDown}
          onClick={() => onMove(exercise.id, "down")}
          variant="secondary"
        >
          <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="M12 5v14m0 0l7-7m-7 7l-7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Button>
        <Button
          aria-label="Editar"
          onClick={() => void navigate(`/ejercicios/${exercise.id}/editar`)}
          variant="secondary"
        >
          <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="M15.232 5.232l3.536 3.536M9 11l-4 4V7a2 2 0 012-2h2m0 0l2.586-2.586a2 2 0 012.828 0L16 5m-4 4l3.536-3.536" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3 21h18" strokeLinecap="round" />
          </svg>
        </Button>
        <Button
          aria-label="Eliminar"
          onClick={() => onDelete(exercise)}
          variant="secondary"
        >
          <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Button>
      </div>
    </article>
  );
}
