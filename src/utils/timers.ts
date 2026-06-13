export type TimerSnapshot = {
  status: "idle" | "running" | "paused";
  startedAt?: string;
  pausedAt?: string;
  totalPausedSeconds: number;
  durationSeconds: number;
};

export function getElapsedSeconds(snapshot: TimerSnapshot, nowMs = Date.now()) {
  if (!snapshot.startedAt) {
    return 0;
  }

  const startedMs = new Date(snapshot.startedAt).getTime();
  const endMs =
    snapshot.status === "paused" && snapshot.pausedAt
      ? new Date(snapshot.pausedAt).getTime()
      : nowMs;

  return Math.max(
    0,
    Math.floor((endMs - startedMs) / 1000) - snapshot.totalPausedSeconds
  );
}

export function getRemainingSeconds(snapshot: TimerSnapshot, nowMs = Date.now()) {
  return Math.max(snapshot.durationSeconds - getElapsedSeconds(snapshot, nowMs), 0);
}

export function getTimerPhase(
  workSeconds: number,
  restSeconds: number,
  elapsedSeconds: number
) {
  return elapsedSeconds >= workSeconds && restSeconds > 0 ? "rest" : "work";
}
