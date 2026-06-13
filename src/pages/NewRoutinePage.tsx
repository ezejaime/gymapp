import { useState } from "react";
import { useNavigate } from "react-router";
import { ImportJsonSection } from "../components/routines/ImportJsonSection";
import { RoutineForm } from "../components/routines/RoutineForm";
import { importRoutineFromJson } from "../db/routineRepository";
import { useActiveProfile } from "../hooks/useActiveProfile";
import { useRoutines } from "../hooks/useRoutines";
import type { ImportedRoutineJson } from "../db/routineRepository";

type Tab = "crear" | "importar";

export function NewRoutinePage() {
  const navigate = useNavigate();
  const { activeProfile } = useActiveProfile();
  const { addRoutine } = useRoutines(activeProfile?.id);
  const [tab, setTab] = useState<Tab>("crear");

  async function handleImport(input: ImportedRoutineJson) {
    if (!activeProfile) {
      return;
    }

    const routine = await importRoutineFromJson(activeProfile.id, input);
    void navigate(`/rutinas/${routine.id}`);
  }

  return (
    <section className="flex flex-1 flex-col gap-6">
      <header className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-wide text-neutral-500">
          Mis rutinas
        </p>
        <h1 className="text-3xl font-semibold">Nueva rutina</h1>
      </header>

      <div className="flex gap-4 border-b border-neutral-200">
        <button
          className={`pb-2 text-sm font-semibold transition ${
            tab === "crear"
              ? "border-b-2 border-black text-black"
              : "text-neutral-500 hover:text-neutral-700"
          }`}
          onClick={() => setTab("crear")}
          type="button"
        >
          Crear desde cero
        </button>
        <button
          className={`pb-2 text-sm font-semibold transition ${
            tab === "importar"
              ? "border-b-2 border-black text-black"
              : "text-neutral-500 hover:text-neutral-700"
          }`}
          onClick={() => setTab("importar")}
          type="button"
        >
          Importar desde JSON
        </button>
      </div>

      {tab === "crear" ? (
        <RoutineForm
          onCancel={() => void navigate("/rutinas")}
          onSubmit={async (values) => {
            const routine = await addRoutine(values);
            void navigate(`/rutinas/${routine.id}`);
          }}
          submitLabel="Guardar"
        />
      ) : (
        <ImportJsonSection onImport={handleImport} />
      )}
    </section>
  );
}
