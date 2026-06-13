import { useNavigate } from "react-router";
import type { Routine } from "../../types";
import { useRoutineImageUrl } from "../../hooks/useRoutineImageUrl";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

type RoutineCardProps = {
  routine: Routine;
  onDuplicate: (routineId: string) => void;
  onDelete: (routine: Routine) => void;
  onExport: (routineId: string) => void;
};

export function RoutineCard({ routine, onDuplicate, onDelete, onExport }: RoutineCardProps) {
  const navigate = useNavigate();
  const coverUrl = useRoutineImageUrl(routine.cover_image_blob_id);

  return (
    <Card className="overflow-hidden p-0">
      <button
        className="grid w-full text-left"
        onClick={() => void navigate(`/rutinas/${routine.id}`)}
        type="button"
      >
        {coverUrl ? (
          <div className="aspect-[5/4] w-full bg-neutral-100">
            <img
              alt=""
              className="h-full w-full object-cover"
              src={coverUrl}
            />
          </div>
        ) : null}
        <div className="grid gap-2 p-4">
          <h2 className="text-xl font-semibold">{routine.title}</h2>
          <p className="line-clamp-2 text-sm leading-tight text-neutral-700">
            {routine.description || "Sin descripción"}
          </p>
        </div>
      </button>

      <div className="flex flex-wrap gap-2 border-t border-neutral-200 p-3">
        <Button
          onClick={() => void navigate(`/rutinas/${routine.id}/editar`)}
          variant="secondary"
        >
          Editar
        </Button>
        <Button onClick={() => onDuplicate(routine.id)} variant="secondary">
          Duplicar
        </Button>
        <Button onClick={() => onExport(routine.id)} variant="secondary">
          Exportar
        </Button>
        <Button onClick={() => onDelete(routine)} variant="secondary">
          Eliminar
        </Button>
      </div>
    </Card>
  );
}
