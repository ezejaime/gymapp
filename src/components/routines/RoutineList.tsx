import type { Routine } from "../../types";
import { EmptyRoutineCard } from "./EmptyRoutineCard";
import { RoutineCard } from "./RoutineCard";

type RoutineListProps = {
  routines: Routine[];
  onDuplicate: (routineId: string) => void;
  onDelete: (routine: Routine) => void;
};

export function RoutineList({ routines, onDuplicate, onDelete }: RoutineListProps) {
  return (
    <div className="grid gap-4">
      {routines.map((routine) => (
        <RoutineCard
          key={routine.id}
          onDelete={onDelete}
          onDuplicate={onDuplicate}
          routine={routine}
        />
      ))}

      <EmptyRoutineCard />
    </div>
  );
}
