import { useNavigate } from "react-router";
import { ClearDataButton } from "../components/settings/ClearDataButton";
import { ExportDataButton } from "../components/settings/ExportDataButton";
import { ImportDataButton } from "../components/settings/ImportDataButton";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { useActiveProfile } from "../hooks/useActiveProfile";
import { useBackup } from "../hooks/useBackup";

export function SettingsPage() {
  const navigate = useNavigate();
  const { activeProfile, clearActiveProfile } = useActiveProfile();
  const { clearLocalData, error, exportBackup, importBackup, isWorking } =
    useBackup();

  function handleChangeProfile() {
    clearActiveProfile();
    void navigate("/perfiles");
  }

  async function handleImport(file: File) {
    const confirmed = window.confirm(
      "Esto va a reemplazar todos los datos actuales. No se puede deshacer."
    );

    if (!confirmed) {
      return;
    }

    const imported = await importBackup(file);

    if (imported) {
      void navigate("/perfiles");
    }
  }

  async function handleClear() {
    const confirmed = window.confirm(
      "Esto va a borrar todos los datos locales. No se puede deshacer."
    );

    if (!confirmed) {
      return;
    }

    const cleared = await clearLocalData();

    if (cleared) {
      void navigate("/perfiles");
    }
  }

  return (
    <section className="flex flex-1 flex-col gap-6">
      <header className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-wide text-neutral-500">
            Ajustes
          </p>
          <h1 className="text-3xl font-semibold">Datos locales</h1>
        </div>
        <Button onClick={() => void navigate("/rutinas")} variant="ghost">
          Volver
        </Button>
      </header>

      <Card className="space-y-4 p-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Perfil activo</h2>
          <p className="text-sm text-neutral-700">
            {activeProfile?.name ?? "Sin perfil activo"}
          </p>
        </div>
        <Button onClick={handleChangeProfile} variant="secondary">
          Cambiar perfil
        </Button>
      </Card>

      <Card className="space-y-4 p-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Backup</h2>
          <p className="text-sm text-neutral-700">
            Exportá o restaurá todos los datos guardados en este dispositivo.
          </p>
        </div>
        <div className="grid gap-3">
          <ExportDataButton
            disabled={isWorking}
            onExport={() => void exportBackup()}
          />
          <ImportDataButton
            disabled={isWorking}
            onImport={(file) => void handleImport(file)}
          />
        </div>
      </Card>

      <Card className="space-y-4 border-neutral-400 p-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Limpiar datos</h2>
          <p className="text-sm text-neutral-700">Esto no se puede deshacer.</p>
        </div>
        <ClearDataButton disabled={isWorking} onClear={() => void handleClear()} />
      </Card>

      {error ? <p className="text-sm text-neutral-700">{error}</p> : null}
    </section>
  );
}
