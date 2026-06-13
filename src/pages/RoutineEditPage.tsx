import { Navigate, useNavigate, useParams } from "react-router";
import { RoutineForm } from "../components/routines/RoutineForm";
import { useRoutine } from "../hooks/useRoutine";

export function RoutineEditPage() {
  const navigate = useNavigate();
  const { routineId } = useParams();
  const { error, isLoading, routine, saveRoutine } = useRoutine(routineId);

  if (isLoading) {
    return <p className="text-neutral-700">Cargando...</p>;
  }

  if (error) {
    return <p className="text-neutral-700">{error}</p>;
  }

  if (!routine) {
    return <Navigate replace to="/rutinas" />;
  }

  return (
    <section className="flex flex-1 flex-col gap-6">
      <header className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-wide text-neutral-500">
          Mis rutinas
        </p>
        <h1 className="text-3xl font-semibold">Editar rutina</h1>
      </header>

      <RoutineForm
        initialRoutine={routine}
        onCancel={() => void navigate(`/rutinas/${routine.id}`)}
        onSubmit={async (values) => {
          await saveRoutine(values);
          void navigate(`/rutinas/${routine.id}`);
        }}
        submitLabel="Guardá los cambios"
      />
    </section>
  );
}
