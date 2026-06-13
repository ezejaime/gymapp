import { useRef, useState } from "react";
import { parseRoutineImportJson } from "../../db/routineRepository";
import type { ImportedRoutineJson } from "../../db/routineRepository";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

type ImportJsonSectionProps = {
  onImport: (input: ImportedRoutineJson) => Promise<void>;
};

export function ImportJsonSection({ onImport }: ImportJsonSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | undefined>();
  const [preview, setPreview] = useState<ImportedRoutineJson | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    setError(undefined);
    setPreview(undefined);

    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.name.endsWith(".json")) {
      setError("El archivo tiene que ser .json.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      try {
        const parsed = parseRoutineImportJson(reader.result as string);
        setPreview(parsed);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "No pudimos leer el archivo."
        );
      }
    };

    reader.onerror = () => {
      setError("No pudimos leer el archivo.");
    };

    reader.readAsText(file);
  }

  async function handleImport() {
    if (!preview) {
      return;
    }

    setIsSubmitting(true);
    setError(undefined);

    try {
      await onImport(preview);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No pudimos importar la rutina."
      );
      setIsSubmitting(false);
    }
  }

  function handleReset() {
    setPreview(undefined);
    setError(undefined);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <label
          className="flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-neutral-300 p-6 text-sm font-medium text-neutral-700 hover:border-neutral-400"
          htmlFor="import-json-file"
        >
          {preview
            ? `Rutina: ${preview.title}`
            : "Elegí un archivo .json"}
        </label>
        <input
          accept=".json"
          className="hidden"
          id="import-json-file"
          onChange={handleFileSelected}
          ref={fileInputRef}
          type="file"
        />
      </div>

      {error ? (
        <p className="text-sm text-neutral-700">{error}</p>
      ) : null}

      {preview ? (
        <Card className="grid gap-3 p-4">
          <div className="grid gap-1">
            <p className="text-sm font-medium uppercase tracking-wide text-neutral-500">
              Vista previa
            </p>
            <h3 className="text-xl font-semibold">{preview.title}</h3>
            {preview.description ? (
              <p className="text-sm text-neutral-700">{preview.description}</p>
            ) : null}
          </div>

          {preview.exercises && preview.exercises.length > 0 ? (
            <div className="grid gap-2">
              <p className="text-sm font-medium text-neutral-600">
                Ejercicios ({preview.exercises.length})
              </p>
              <ul className="grid gap-1 text-sm text-neutral-700">
                {preview.exercises.map((exercise, index) => (
                  <li className="flex gap-2" key={index}>
                    <span className="text-neutral-400">{index + 1}.</span>
                    <span>{exercise.name}</span>
                    <span className="text-neutral-400">
                      {exercise.type === "sets"
                        ? `· ${exercise.sets_config?.sets ?? "?"} series`
                        : `· ${exercise.timed_config?.rounds ?? "?"} rondas`}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="grid grid-cols-2 gap-3">
            <Button
              disabled={isSubmitting}
              onClick={handleReset}
              variant="secondary"
            >
              Cancelar
            </Button>
            <Button disabled={isSubmitting} onClick={handleImport}>
              {isSubmitting ? "Importando..." : "Importar rutina"}
            </Button>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
