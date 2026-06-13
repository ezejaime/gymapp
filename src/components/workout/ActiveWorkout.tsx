import { useNavigate } from "react-router";
import type { Exercise, WorkoutSetLog, WorkoutTimedLog } from "../../types";
import { exerciseCategoryLabels, exerciseTypeLabels } from "../../utils/exerciseLabels";
import { SetTracker } from "./SetTracker";
import { TimerExercise } from "./TimerExercise";

type ActiveWorkoutProps = {
  exercises: Exercise[];
  setLogs: WorkoutSetLog[];
  timedLogs: WorkoutTimedLog[];
  onUpdateSetLog: (
    logId: string,
    updates: Pick<WorkoutSetLog, "weight" | "completed">
  ) => Promise<void>;
  onUpdateTimedLog: (
    logId: string,
    updates: Partial<WorkoutTimedLog>
  ) => Promise<void>;
  onStartTimedLog: (logId: string) => Promise<void>;
  onPauseTimedLog: (logId: string) => Promise<void>;
  onResetTimedLog: (logId: string) => Promise<void>;
};

export function ActiveWorkout({
  exercises,
  setLogs,
  timedLogs,
  onUpdateSetLog,
  onUpdateTimedLog,
  onStartTimedLog,
  onPauseTimedLog,
  onResetTimedLog
}: ActiveWorkoutProps) {
  const navigate = useNavigate();

  return (
    <div className="grid gap-4">
      {exercises.map((exercise) => {
        const exerciseSetLogs = setLogs.filter(
          (log) => log.exercise_id === exercise.id
        );
        const exerciseTimedLogs = timedLogs.filter(
          (log) => log.exercise_id === exercise.id
        );

        return (
          <section
            className="grid gap-3 rounded-lg border border-neutral-200 p-4"
            key={exercise.id}
          >
            <header className="grid gap-1">
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                {exerciseCategoryLabels[exercise.category]} ·{" "}
                {exerciseTypeLabels[exercise.type]}
              </p>
              <h2 className="text-xl font-semibold">{exercise.name}</h2>
              {exercise.type === "sets" ? (
                <button
                  className="self-start text-sm font-semibold text-neutral-700"
                  onClick={() =>
                    void navigate(`/ejercicios/${exercise.id}/historico`)
                  }
                  type="button"
                >
                  Histórico
                </button>
              ) : null}
            </header>

            {exercise.type === "sets" ? (
              <SetTracker logs={exerciseSetLogs} onUpdate={onUpdateSetLog} />
            ) : (
              <TimerExercise
                logs={exerciseTimedLogs}
                onPause={onPauseTimedLog}
                onReset={onResetTimedLog}
                onStart={onStartTimedLog}
                onUpdate={onUpdateTimedLog}
              />
            )}
          </section>
        );
      })}
    </div>
  );
}
