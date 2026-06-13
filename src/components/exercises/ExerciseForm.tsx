import { type FormEvent, useState } from "react";
import type {
  Exercise,
  ExerciseCategory,
  ExerciseType,
  SetsExerciseConfig,
  TimedExerciseConfig
} from "../../types";
import { exerciseCategoryLabels, exerciseTypeLabels } from "../../utils/exerciseLabels";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Textarea } from "../ui/Textarea";

export type ExerciseFormValues = {
  name: string;
  short_description: string;
  full_description: string;
  video_url?: string;
  video_thumbnail_url?: string;
  category: ExerciseCategory;
  type: ExerciseType;
  sets_config?: {
    sets: number;
    reps: number;
    base_weight: number;
  };
  timed_config?: {
    work_seconds: number;
    rest_seconds: number;
    rounds: number;
  };
};

type ExerciseFormProps = {
  initialExercise?: Exercise;
  initialSetsConfig?: SetsExerciseConfig;
  initialTimedConfig?: TimedExerciseConfig;
  submitLabel: string;
  onCancel: () => void;
  onSubmit: (values: ExerciseFormValues) => Promise<void>;
};

function toNumber(value: string) {
  return Number.isFinite(Number(value)) ? Number(value) : 0;
}

export function ExerciseForm({
  initialExercise,
  initialSetsConfig,
  initialTimedConfig,
  submitLabel,
  onCancel,
  onSubmit
}: ExerciseFormProps) {
  const [name, setName] = useState(initialExercise?.name ?? "");
  const [shortDescription, setShortDescription] = useState(
    initialExercise?.short_description ?? ""
  );
  const [fullDescription, setFullDescription] = useState(
    initialExercise?.full_description ?? ""
  );
  const [videoUrl, setVideoUrl] = useState(initialExercise?.video_url ?? "");
  const [videoThumbnailUrl, setVideoThumbnailUrl] = useState(
    initialExercise?.video_thumbnail_url ?? ""
  );
  const [category, setCategory] = useState<ExerciseCategory>(
    initialExercise?.category ?? "warmup"
  );
  const [type, setType] = useState<ExerciseType>(initialExercise?.type ?? "sets");
  const [sets, setSets] = useState(String(initialSetsConfig?.sets ?? 3));
  const [reps, setReps] = useState(String(initialSetsConfig?.reps ?? 10));
  const [baseWeight, setBaseWeight] = useState(
    String(initialSetsConfig?.base_weight ?? 0)
  );
  const [workSeconds, setWorkSeconds] = useState(
    String(initialTimedConfig?.work_seconds ?? 40)
  );
  const [restSeconds, setRestSeconds] = useState(
    String(initialTimedConfig?.rest_seconds ?? 20)
  );
  const [rounds, setRounds] = useState(String(initialTimedConfig?.rounds ?? 3));
  const [error, setError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim()) {
      setError("Escribí un nombre para el ejercicio.");
      return;
    }

    setError(undefined);
    setIsSubmitting(true);

    try {
      await onSubmit({
        name,
        short_description: shortDescription,
        full_description: fullDescription,
        video_url: videoUrl,
        video_thumbnail_url: videoThumbnailUrl,
        category,
        type,
        sets_config:
          type === "sets"
            ? {
                sets: toNumber(sets),
                reps: toNumber(reps),
                base_weight: toNumber(baseWeight)
              }
            : undefined,
        timed_config:
          type === "timed"
            ? {
                work_seconds: toNumber(workSeconds),
                rest_seconds: toNumber(restSeconds),
                rounds: toNumber(rounds)
              }
            : undefined
      });
    } catch {
      setError("No pudimos guardar el ejercicio.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <Input
        label="Nombre"
        name="exerciseName"
        onChange={(event) => setName(event.target.value)}
        placeholder="Ej: Press banca"
        value={name}
      />

      <Textarea
        label="Descripción breve"
        name="shortDescription"
        onChange={(event) => setShortDescription(event.target.value)}
        placeholder="Una ayuda corta para reconocerlo."
        value={shortDescription}
      />

      <Textarea
        label="Descripción"
        name="fullDescription"
        onChange={(event) => setFullDescription(event.target.value)}
        placeholder="Técnica, ajustes o notas del ejercicio."
        value={fullDescription}
      />

      <Input
        label="Video"
        name="videoUrl"
        onChange={(event) => setVideoUrl(event.target.value)}
        placeholder="https://..."
        type="url"
        value={videoUrl}
      />

      <Input
        label="Thumbnail del video"
        name="videoThumbnailUrl"
        onChange={(event) => setVideoThumbnailUrl(event.target.value)}
        placeholder="https://..."
        type="url"
        value={videoThumbnailUrl}
      />

      <Select
        label="Categoría"
        name="category"
        onChange={(event) => setCategory(event.target.value as ExerciseCategory)}
        value={category}
      >
        <option value="warmup">{exerciseCategoryLabels.warmup}</option>
        <option value="core">{exerciseCategoryLabels.core}</option>
        <option value="strength">{exerciseCategoryLabels.strength}</option>
      </Select>

      <Select
        label="Tipo"
        name="type"
        onChange={(event) => setType(event.target.value as ExerciseType)}
        value={type}
      >
        <option value="sets">{exerciseTypeLabels.sets}</option>
        <option value="timed">{exerciseTypeLabels.timed}</option>
      </Select>

      {type === "sets" ? (
        <div className="grid grid-cols-3 gap-3">
          <Input
            label="Series"
            min="1"
            name="sets"
            onChange={(event) => setSets(event.target.value)}
            type="number"
            value={sets}
          />
          <Input
            label="Reps"
            min="1"
            name="reps"
            onChange={(event) => setReps(event.target.value)}
            type="number"
            value={reps}
          />
          <Input
            label="Peso"
            min="0"
            name="baseWeight"
            onChange={(event) => setBaseWeight(event.target.value)}
            step="0.5"
            type="number"
            value={baseWeight}
          />
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          <Input
            label="Trabajo"
            min="1"
            name="workSeconds"
            onChange={(event) => setWorkSeconds(event.target.value)}
            type="number"
            value={workSeconds}
          />
          <Input
            label="Descanso"
            min="0"
            name="restSeconds"
            onChange={(event) => setRestSeconds(event.target.value)}
            type="number"
            value={restSeconds}
          />
          <Input
            label="Rondas"
            min="1"
            name="rounds"
            onChange={(event) => setRounds(event.target.value)}
            type="number"
            value={rounds}
          />
        </div>
      )}

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
