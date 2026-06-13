import { Navigate, useNavigate, useParams } from "react-router";
import { ExerciseForm, type ExerciseFormValues } from "../components/exercises/ExerciseForm";
import { useActiveProfile } from "../hooks/useActiveProfile";
import { useRoutine } from "../hooks/useRoutine";
import { useExercises } from "../hooks/useExercises";

export function NewExercisePage() {
  const navigate = useNavigate();
  const { routineId } = useParams();
  const { activeProfile } = useActiveProfile();
  const { isLoading, routine } = useRoutine(routineId);
  const { addExercise } = useExercises(routineId);

  if (isLoading) {
    return <p className="text-neutral-700">Cargando...</p>;
  }

  if (!routine || !activeProfile) {
    return <Navigate replace to="/rutinas" />;
  }

  const currentRoutine = routine;
  const currentProfile = activeProfile;

  async function handleSubmit(values: ExerciseFormValues) {
    const exercise = await addExercise({
      ...values,
      routine_id: currentRoutine.id,
      profile_id: currentProfile.id
    });
    void navigate(`/ejercicios/${exercise.id}`);
  }

  return (
    <section className="flex flex-1 flex-col gap-6">
      <header className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-wide text-neutral-500">
          {currentRoutine.title}
        </p>
        <h1 className="text-3xl font-semibold">Nuevo ejercicio</h1>
      </header>

      <ExerciseForm
        onCancel={() => void navigate(`/rutinas/${currentRoutine.id}`)}
        onSubmit={handleSubmit}
        submitLabel="Guardar"
      />
    </section>
  );
}
