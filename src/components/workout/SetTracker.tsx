import type { WorkoutSetLog } from "../../types";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

type SetTrackerProps = {
  logs: WorkoutSetLog[];
  onUpdate: (
    logId: string,
    updates: Pick<WorkoutSetLog, "weight" | "completed">
  ) => Promise<void>;
};

export function SetTracker({ logs, onUpdate }: SetTrackerProps) {
  return (
    <div className="grid gap-2">
      {logs.map((log) => (
        <div
          className="grid grid-cols-2 items-end gap-3 rounded-lg border border-neutral-200 p-3 sm:grid-cols-[1fr_1fr_1.3fr_auto]"
          key={log.id}
        >
          <div>
            <p className="text-xs font-medium text-neutral-500">Serie</p>
            <p className="text-base font-semibold">{log.set_number}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-neutral-500">Reps</p>
            <p className="text-base font-semibold">{log.reps}</p>
          </div>
          <Input
            label="Peso"
            min="0"
            onChange={(event) =>
              void onUpdate(log.id, {
                weight: Number(event.target.value),
                completed: log.completed
              })
            }
            step="0.5"
            type="number"
            value={log.weight}
          />
          <Button
            aria-label="Listo"
            className="min-w-12"
            onClick={() =>
              void onUpdate(log.id, {
                weight: log.weight,
                completed: !log.completed
              })
            }
            variant={log.completed ? "primary" : "secondary"}
          >
            <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Button>
        </div>
      ))}
    </div>
  );
}
