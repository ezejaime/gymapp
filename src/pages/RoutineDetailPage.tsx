import { Navigate, useNavigate, useParams } from "react-router";
import { CategorySection } from "../components/exercises/CategorySection";
import { Button } from "../components/ui/Button";
import { useExercises } from "../hooks/useExercises";
import { useActiveProfile } from "../hooks/useActiveProfile";
import { useRoutine } from "../hooks/useRoutine";
import { useRoutineImageUrl } from "../hooks/useRoutineImageUrl";
import { useActiveWorkoutSession } from "../hooks/useWorkoutSession";
import type { Exercise } from "../types";
import { exerciseCategoryOrder } from "../utils/exerciseLabels";

export function RoutineDetailPage() {
  const navigate = useNavigate();
  const { routineId } = useParams();
  const { activeProfile } = useActiveProfile();
  const { error, isLoading, routine } = useRoutine(routineId);
  const { activeSession, beginWorkoutSession, discardActiveSession } =
    useActiveWorkoutSession(activeProfile?.id);
  const {
    deleteExercise,
    error: exercisesError,
    exercises,
    isLoading: exercisesLoading,
    moveExercise
  } = useExercises(routineId);
  const coverUrl = useRoutineImageUrl(routine?.cover_image_blob_id);

  if (isLoading) {
    return <p className="text-neutral-700">Cargando...</p>;
  }

  if (error) {
    return <p className="text-neutral-700">{error}</p>;
  }

  if (!routine) {
    return <Navigate replace to="/rutinas" />;
  }

  const currentRoutine = routine;

  async function handleDeleteExercise(exercise: Exercise) {
    const confirmed = window.confirm(
      `¿Eliminar "${exercise.name}"? Esto no se puede deshacer.`
    );

    if (!confirmed) {
      return;
    }

    await deleteExercise(exercise.id);
  }

  async function handleStartWorkout() {
    if (!activeProfile) {
      return;
    }

    if (activeSession) {
      const shouldDiscard = window.confirm(
        "Ya tenés una rutina en curso. ¿Querés descartarla y empezar esta?"
      );

      if (!shouldDiscard) {
        void navigate(`/rutinas/${activeSession.routine_id}/sesion`);
        return;
      }

      await discardActiveSession(activeSession.id);
    }

    const session = await beginWorkoutSession(currentRoutine.id);
    void navigate(`/rutinas/${session.routine_id}/sesion`);
  }

  return (
    <section className="flex flex-1 flex-col gap-6">
      <button
        className="self-start text-sm font-semibold text-neutral-700"
        onClick={() => void navigate("/rutinas")}
        type="button"
      >
        Volver
      </button>

      {coverUrl ? (
        <div className="overflow-hidden rounded-lg border border-neutral-200">
          <div className="aspect-[5/4] bg-neutral-100">
            <img alt="" className="h-full w-full object-cover" src={coverUrl} />
          </div>
        </div>
      ) : null}

      <div className="rounded-lg border border-neutral-200">
        <div className="grid gap-3 p-4">
          <h1 className="text-3xl font-semibold">{routine.title}</h1>
          <p className="text-neutral-700">
            {routine.description || "Sin descripción"}
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-2xl font-semibold">Ejercicios</h2>
          <Button
            onClick={() => void navigate(`/rutinas/${routine.id}/ejercicios/nuevo`)}
            variant="secondary"
          >
            Agregar
          </Button>
        </div>

        {exercisesLoading ? (
          <p className="text-neutral-700">Cargando ejercicios...</p>
        ) : null}
        {exercisesError ? <p className="text-neutral-700">{exercisesError}</p> : null}

        {!exercisesLoading && exercises.length === 0 ? (
          <div className="rounded-lg border border-dashed border-neutral-300 p-5 text-center">
            <p className="text-neutral-700">No tenés ejercicios todavía.</p>
          </div>
        ) : null}

        {exerciseCategoryOrder.map((category) => (
          <CategorySection
            allExercises={exercises}
            category={category}
            exercises={exercises.filter((exercise) => exercise.category === category)}
            key={category}
            onDelete={(exercise) => void handleDeleteExercise(exercise)}
            onMove={(exerciseId, direction) =>
              void moveExercise(exerciseId, direction)
            }
          />
        ))}
      </div>

      <Button onClick={() => void navigate(`/rutinas/${routine.id}/editar`)}>
        Editar rutina
      </Button>

      <Button onClick={() => void handleStartWorkout()}>
        Comenzar rutina
      </Button>
    </section>
  );
}
