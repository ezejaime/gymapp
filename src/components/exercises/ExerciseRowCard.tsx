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
          <h3 className="truncate text-lg font-semibold">{exercise.name}</h3>
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

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Button
          disabled={!canMoveUp}
          onClick={() => onMove(exercise.id, "up")}
          variant="secondary"
        >
          Subir
        </Button>
        <Button
          disabled={!canMoveDown}
          onClick={() => onMove(exercise.id, "down")}
          variant="secondary"
        >
          Bajar
        </Button>
        <Button
          onClick={() => void navigate(`/ejercicios/${exercise.id}/editar`)}
          variant="secondary"
        >
          Editar
        </Button>
        <Button onClick={() => onDelete(exercise)} variant="secondary">
          Eliminar
        </Button>
      </div>
    </article>
  );
}
