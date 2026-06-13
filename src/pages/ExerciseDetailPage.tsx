import { Navigate, useNavigate, useParams } from "react-router";
import { Button } from "../components/ui/Button";
import { useExercise } from "../hooks/useExercise";
import {
  exerciseCategoryLabels,
  exerciseTypeLabels
} from "../utils/exerciseLabels";

function getYoutubeEmbedUrl(url?: string) {
  if (!url) {
    return undefined;
  }

  try {
    const parsedUrl = new URL(url);
    const videoId =
      parsedUrl.hostname.includes("youtu.be")
        ? parsedUrl.pathname.slice(1)
        : parsedUrl.searchParams.get("v");

    return videoId ? `https://www.youtube.com/embed/${videoId}` : undefined;
  } catch {
    return undefined;
  }
}

export function ExerciseDetailPage() {
  const navigate = useNavigate();
  const { exerciseId } = useParams();
  const { exerciseWithConfig, isLoading } = useExercise(exerciseId);

  if (isLoading) {
    return <p className="text-neutral-700">Cargando...</p>;
  }

  if (!exerciseWithConfig) {
    return <Navigate replace to="/rutinas" />;
  }

  const { exercise, sets_config, timed_config } = exerciseWithConfig;
  const embedUrl = getYoutubeEmbedUrl(exercise.video_url);

  return (
    <section className="flex flex-1 flex-col gap-6">
      <button
        className="self-start text-sm font-semibold text-neutral-700"
        onClick={() => void navigate(`/rutinas/${exercise.routine_id}`)}
        type="button"
      >
        Volver
      </button>

      {embedUrl ? (
        <iframe
          className="aspect-video w-full rounded-lg border border-neutral-200"
          src={embedUrl}
          title={exercise.name}
        />
      ) : null}

      {!embedUrl && exercise.video_thumbnail_url ? (
        <img
          alt=""
          className="aspect-video w-full rounded-lg border border-neutral-200 object-cover"
          src={exercise.video_thumbnail_url}
        />
      ) : null}

      <header className="grid gap-3">
        <h1 className="text-3xl font-semibold">{exercise.name}</h1>
        <p className="text-neutral-700">
          {exercise.full_description || exercise.short_description || "Sin descripción"}
        </p>
      </header>

      <dl className="grid gap-3 rounded-lg border border-neutral-200 p-4">
        <div>
          <dt className="text-sm font-medium text-neutral-500">Categoría</dt>
          <dd className="text-base">{exerciseCategoryLabels[exercise.category]}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-neutral-500">Tipo</dt>
          <dd className="text-base">{exerciseTypeLabels[exercise.type]}</dd>
        </div>
        {sets_config ? (
          <div>
            <dt className="text-sm font-medium text-neutral-500">Series</dt>
            <dd className="text-base">
              {sets_config.sets} x {sets_config.reps} · {sets_config.base_weight} kg
            </dd>
          </div>
        ) : null}
        {timed_config ? (
          <div>
            <dt className="text-sm font-medium text-neutral-500">Tiempo</dt>
            <dd className="text-base">
              {timed_config.rounds} rondas · {timed_config.work_seconds}s trabajo ·{" "}
              {timed_config.rest_seconds}s descanso
            </dd>
          </div>
        ) : null}
      </dl>

      {exercise.video_url && !embedUrl ? (
        <Button onClick={() => window.open(exercise.video_url, "_blank", "noopener")}>
          Abrir video
        </Button>
      ) : null}

      <Button onClick={() => void navigate(`/ejercicios/${exercise.id}/editar`)}>
        Editar ejercicio
      </Button>

      {exercise.type === "sets" ? (
        <Button
          onClick={() => void navigate(`/ejercicios/${exercise.id}/historico`)}
          variant="secondary"
        >
          Histórico
        </Button>
      ) : null}
    </section>
  );
}
