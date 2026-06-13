import { Navigate, useNavigate, useParams } from "react-router";
import { ExerciseForm, type ExerciseFormValues } from "../components/exercises/ExerciseForm";
import { useActiveProfile } from "../hooks/useActiveProfile";
import { useExercise } from "../hooks/useExercise";

export function ExerciseEditPage() {
  const navigate = useNavigate();
  const { exerciseId } = useParams();
  const { activeProfile } = useActiveProfile();
  const { exerciseWithConfig, isLoading, saveExercise } = useExercise(exerciseId);

  if (isLoading) {
    return <p className="text-neutral-700">Cargando...</p>;
  }

  if (!exerciseWithConfig || !activeProfile) {
    return <Navigate replace to="/rutinas" />;
  }

  const { exercise, sets_config, timed_config } = exerciseWithConfig;
  const currentProfile = activeProfile;

  async function handleSubmit(values: ExerciseFormValues) {
    await saveExercise({
      ...values,
      routine_id: exercise.routine_id,
      profile_id: currentProfile.id
    });
    void navigate(`/ejercicios/${exercise.id}`);
  }

  return (
    <section className="flex flex-1 flex-col gap-6">
      <header className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-wide text-neutral-500">
          Editar ejercicio
        </p>
        <h1 className="text-3xl font-semibold">{exercise.name}</h1>
      </header>

      <ExerciseForm
        initialExercise={exercise}
        initialSetsConfig={sets_config}
        initialTimedConfig={timed_config}
        onCancel={() => void navigate(`/ejercicios/${exercise.id}`)}
        onSubmit={handleSubmit}
        submitLabel="Guardá los cambios"
      />
    </section>
  );
}
