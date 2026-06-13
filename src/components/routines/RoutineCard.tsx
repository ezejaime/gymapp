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
          aria-label="Editar"
          onClick={() => void navigate(`/rutinas/${routine.id}/editar`)}
          variant="secondary"
        >
          <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="M15.232 5.232l3.536 3.536M9 11l-4 4V7a2 2 0 012-2h2m0 0l2.586-2.586a2 2 0 012.828 0L16 5m-4 4l3.536-3.536" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3 21h18" strokeLinecap="round" />
          </svg>
        </Button>
        <Button
          aria-label="Duplicar"
          onClick={() => onDuplicate(routine.id)}
          variant="secondary"
        >
          <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Button>
        <Button
          aria-label="Exportar"
          onClick={() => onExport(routine.id)}
          variant="secondary"
        >
          <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Button>
        <Button
          aria-label="Eliminar"
          onClick={() => onDelete(routine)}
          variant="secondary"
        >
          <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Button>
      </div>
    </Card>
  );
}
