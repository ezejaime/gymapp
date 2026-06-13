import { type FormEvent, useState } from "react";
import type { Routine } from "../../types";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";

type RoutineFormValues = {
  title: string;
  description: string;
  coverImage?: File;
};

type RoutineFormProps = {
  initialRoutine?: Routine;
  submitLabel: string;
  onCancel: () => void;
  onSubmit: (values: RoutineFormValues) => Promise<void>;
};

export function RoutineForm({
  initialRoutine,
  submitLabel,
  onCancel,
  onSubmit
}: RoutineFormProps) {
  const [title, setTitle] = useState(initialRoutine?.title ?? "");
  const [description, setDescription] = useState(initialRoutine?.description ?? "");
  const [coverImage, setCoverImage] = useState<File | undefined>();
  const [error, setError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim()) {
      setError("Escribí un título para la rutina.");
      return;
    }

    setIsSubmitting(true);
    setError(undefined);

    try {
      await onSubmit({
        title,
        description,
        coverImage
      });
    } catch {
      setError("No pudimos guardar la rutina.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <Input
        autoComplete="off"
        label="Título"
        name="routineTitle"
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Ej: Tren superior"
        value={title}
      />

      <Textarea
        label="Descripción"
        name="routineDescription"
        onChange={(event) => setDescription(event.target.value)}
        placeholder="Una nota corta para ubicar esta rutina."
        value={description}
      />

      <Input
        accept="image/*"
        label="Imagen de portada"
        name="routineCover"
        onChange={(event) => setCoverImage(event.target.files?.[0])}
        type="file"
      />

      {initialRoutine?.cover_image_blob_id && !coverImage ? (
        <p className="text-sm text-neutral-600">
          Si no elegís otra imagen, se mantiene la portada actual.
        </p>
      ) : null}

      {error ? <p className="text-sm text-neutral-700">{error}</p> : null}

      <div className="grid grid-cols-2 gap-3">
        <Button onClick={onCancel} variant="secondary">
          Cancelar
        </Button>
        <Button disabled={isSubmitting} type="submit">
          {isSubmitting ? "Guardando..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
