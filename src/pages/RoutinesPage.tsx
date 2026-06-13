import { useNavigate } from "react-router";
import { RoutineList } from "../components/routines/RoutineList";
import { Button } from "../components/ui/Button";
import { FloatingActionButton } from "../components/ui/FloatingActionButton";
import { ActiveSessionPrompt } from "../components/workout/ActiveSessionPrompt";
import { exportRoutineToJson } from "../db/routineRepository";
import { useActiveProfile } from "../hooks/useActiveProfile";
import { useRoutines } from "../hooks/useRoutines";
import { useActiveWorkoutSession } from "../hooks/useWorkoutSession";
import type { Routine } from "../types";

export function RoutinesPage() {
  const navigate = useNavigate();
  const { activeProfile, clearActiveProfile } = useActiveProfile();
  const { activeSession, discardActiveSession } = useActiveWorkoutSession(
    activeProfile?.id
  );
  const { deleteRoutine, duplicateRoutine, error, isLoading, routines } =
    useRoutines(activeProfile?.id);

  function handleChangeProfile() {
    clearActiveProfile();
    void navigate("/perfiles");
  }

  async function handleDuplicateRoutine(routineId: string) {
    await duplicateRoutine(routineId);
  }

  async function handleDeleteRoutine(routine: Routine) {
    const confirmed = window.confirm(
      `¿Eliminar "${routine.title}"? Esto no se puede deshacer.`
    );

    if (!confirmed) {
      return;
    }

    await deleteRoutine(routine.id);
  }

  async function handleExportRoutine(routineId: string) {
    try {
      const data = await exportRoutineToJson(routineId);
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = `${data.title.toLowerCase().replace(/\s+/g, "-")}.json`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      window.alert("No pudimos exportar la rutina.");
    }
  }

  return (
    <section className="flex flex-1 flex-col gap-6">
      <header className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-wide text-neutral-500">
            {activeProfile?.name}
          </p>
          <h1 className="text-3xl font-semibold">Mis rutinas</h1>
        </div>
        <div className="flex flex-col gap-2">
          <Button onClick={() => void navigate("/progreso")} variant="ghost">
            Progreso
          </Button>
          <Button onClick={() => void navigate("/ajustes")} variant="ghost">
            Ajustes
          </Button>
          <Button onClick={handleChangeProfile} variant="ghost">
            Cambiar
          </Button>
        </div>
      </header>

      {activeSession ? (
        <ActiveSessionPrompt
          onDiscard={discardActiveSession}
          session={activeSession}
        />
      ) : null}

      {isLoading ? <p className="text-neutral-700">Cargando rutinas...</p> : null}
      {error ? <p className="text-neutral-700">{error}</p> : null}

      {!isLoading && routines.length === 0 ? (
        <div className="grid gap-4">
          <div className="rounded-lg border border-dashed border-neutral-300 p-6 text-center">
            <p className="text-base text-neutral-700">
              No tenés rutinas todavía.
            </p>
          </div>
          <RoutineList
            onDelete={(routine) => void handleDeleteRoutine(routine)}
            onDuplicate={(routineId) => void handleDuplicateRoutine(routineId)}
            onExport={(routineId) => void handleExportRoutine(routineId)}
            routines={routines}
          />
        </div>
      ) : null}

      {!isLoading && routines.length > 0 ? (
        <RoutineList
          onDelete={(routine) => void handleDeleteRoutine(routine)}
          onDuplicate={(routineId) => void handleDuplicateRoutine(routineId)}
          onExport={(routineId) => void handleExportRoutine(routineId)}
          routines={routines}
        />
      ) : null}

      {routines.length > 10 ? (
        <FloatingActionButton
          aria-label="Nueva rutina"
          onClick={() => void navigate("/rutinas/nueva")}
        >
          +
        </FloatingActionButton>
      ) : null}
    </section>
  );
}
