import { useEffect, useState } from "react";
import type { WorkoutTimedLog } from "../../types";
import { formatDuration } from "../../utils/formatters";
import {
  getElapsedSeconds,
  getRemainingSeconds,
  getTimerPhase
} from "../../utils/timers";
import { Button } from "../ui/Button";

type TimerExerciseProps = {
  logs: WorkoutTimedLog[];
  onUpdate: (logId: string, updates: Partial<WorkoutTimedLog>) => Promise<void>;
  onStart: (logId: string) => Promise<void>;
  onPause: (logId: string) => Promise<void>;
  onReset: (logId: string) => Promise<void>;
};

export function TimerExercise({
  logs,
  onUpdate,
  onStart,
  onPause,
  onReset
}: TimerExerciseProps) {
  const [, refreshUi] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      refreshUi((current) => current + 1);
    }, 500);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <div className="grid gap-2">
      {logs.map((log) => {
        const durationSeconds = log.work_seconds + log.rest_seconds;
        const elapsedSeconds = getElapsedSeconds({
          status: log.timer_status,
          startedAt: log.timer_started_at,
          pausedAt: log.timer_paused_at,
          totalPausedSeconds: log.total_paused_seconds,
          durationSeconds
        });
        const remainingSeconds = getRemainingSeconds({
          status: log.timer_status,
          startedAt: log.timer_started_at,
          pausedAt: log.timer_paused_at,
          totalPausedSeconds: log.total_paused_seconds,
          durationSeconds
        });
        const phase = getTimerPhase(
          log.work_seconds,
          log.rest_seconds,
          elapsedSeconds
        );

        return (
          <div
            className="grid gap-3 rounded-lg border border-neutral-200 p-3"
            key={log.id}
          >
            <div className="grid grid-cols-3 gap-3">
              <div>
                <p className="text-xs font-medium text-neutral-500">Ronda</p>
                <p className="text-base font-semibold">{log.round_number}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-neutral-500">Estado</p>
                <p className="text-base font-semibold">
                  {log.completed
                    ? "Hecha"
                    : phase === "work"
                      ? "Trabajo"
                      : "Descanso"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-neutral-500">Tiempo</p>
                <p className="text-base font-semibold">
                  {formatDuration(remainingSeconds)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <Button
                disabled={log.completed || log.timer_status === "running"}
                onClick={() => void onStart(log.id)}
                variant="secondary"
              >
                {log.timer_status === "paused" ? "Seguir" : "Iniciar"}
              </Button>
              <Button
                disabled={log.completed || log.timer_status !== "running"}
                onClick={() => void onPause(log.id)}
                variant="secondary"
              >
                Pausar
              </Button>
              <Button onClick={() => void onReset(log.id)} variant="secondary">
                Reiniciar
              </Button>
              <Button
                onClick={() =>
                  void onUpdate(log.id, {
                    completed: !log.completed,
                    timer_status: "idle"
                  })
                }
                variant={log.completed ? "primary" : "secondary"}
              >
                {log.completed ? "Hecha" : "Marcar"}
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
