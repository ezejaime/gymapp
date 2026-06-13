import { Navigate, useNavigate, useParams } from "react-router";
import { ExerciseHistoryChart } from "../components/history/ExerciseHistoryChart";
import { useExercise } from "../hooks/useExercise";
import { useExerciseHistory } from "../hooks/useExerciseHistory";

function formatFullDate(date: string) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(new Date(date));
}

export function ExerciseHistoryPage() {
  const navigate = useNavigate();
  const { exerciseId } = useParams();
  const { exerciseWithConfig, isLoading: exerciseLoading } = useExercise(exerciseId);
  const { error, history, isLoading: historyLoading } =
    useExerciseHistory(exerciseId);

  if (exerciseLoading || historyLoading) {
    return <p className="text-neutral-700">Cargando...</p>;
  }

  if (!exerciseWithConfig) {
    return <Navigate replace to="/rutinas" />;
  }

  const { exercise } = exerciseWithConfig;

  if (exercise.type !== "sets") {
    return <Navigate replace to={`/ejercicios/${exercise.id}`} />;
  }

  return (
    <section className="flex flex-1 flex-col gap-6">
      <button
        className="self-start text-sm font-semibold text-neutral-700"
        onClick={() => void navigate(`/ejercicios/${exercise.id}`)}
        type="button"
      >
        Volver
      </button>

      <header className="grid gap-2">
        <p className="text-sm font-medium uppercase tracking-wide text-neutral-500">
          Histórico
        </p>
        <h1 className="text-3xl font-semibold">{exercise.name}</h1>
      </header>

      {error ? <p className="text-neutral-700">{error}</p> : null}

      {history.length === 0 ? (
        <div className="rounded-lg border border-dashed border-neutral-300 p-5 text-center">
          <p className="text-neutral-700">
            Todavía no hay sesiones finalizadas para este ejercicio.
          </p>
        </div>
      ) : (
        <>
          <ExerciseHistoryChart data={history} />

          <div className="grid gap-2">
            {history.map((point) => (
              <div
                className="flex items-center justify-between rounded-lg border border-neutral-200 p-3"
                key={point.session_id}
              >
                <span className="text-sm text-neutral-700">
                  {formatFullDate(point.date)}
                </span>
                <span className="text-base font-semibold">{point.weight} kg</span>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
