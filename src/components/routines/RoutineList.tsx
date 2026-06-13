import type { Routine } from "../../types";
import { EmptyRoutineCard } from "./EmptyRoutineCard";
import { RoutineCard } from "./RoutineCard";

type RoutineListProps = {
  routines: Routine[];
  onDuplicate: (routineId: string) => void;
  onDelete: (routine: Routine) => void;
  onExport: (routineId: string) => void;
};

export function RoutineList({
  routines,
  onDuplicate,
  onDelete,
  onExport
}: RoutineListProps) {
  return (
    <div className="grid gap-4">
      {routines.map((routine) => (
        <RoutineCard
          key={routine.id}
          onDelete={onDelete}
          onDuplicate={onDuplicate}
          onExport={onExport}
          routine={routine}
        />
      ))}

      <EmptyRoutineCard />
    </div>
  );
}
