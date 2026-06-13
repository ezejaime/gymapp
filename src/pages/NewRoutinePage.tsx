import { useNavigate } from "react-router";
import { RoutineForm } from "../components/routines/RoutineForm";
import { useActiveProfile } from "../hooks/useActiveProfile";
import { useRoutines } from "../hooks/useRoutines";

export function NewRoutinePage() {
  const navigate = useNavigate();
  const { activeProfile } = useActiveProfile();
  const { addRoutine } = useRoutines(activeProfile?.id);

  return (
    <section className="flex flex-1 flex-col gap-6">
      <header className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-wide text-neutral-500">
          Mis rutinas
        </p>
        <h1 className="text-3xl font-semibold">Nueva rutina</h1>
      </header>

      <RoutineForm
        onCancel={() => void navigate("/rutinas")}
        onSubmit={async (values) => {
          const routine = await addRoutine(values);
          void navigate(`/rutinas/${routine.id}`);
        }}
        submitLabel="Guardar"
      />
    </section>
  );
}
