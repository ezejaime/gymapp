import { Navigate, useNavigate, useParams } from "react-router";
import { ActiveWorkout } from "../components/workout/ActiveWorkout";
import { Button } from "../components/ui/Button";
import { FinishWorkoutButton } from "../components/workout/FinishWorkoutButton";
import { useActiveProfile } from "../hooks/useActiveProfile";
import { useExercises } from "../hooks/useExercises";
import { useRoutine } from "../hooks/useRoutine";
import {
  useActiveWorkoutSession,
  useWorkoutSession
} from "../hooks/useWorkoutSession";

export function ActiveRoutinePage() {
  const navigate = useNavigate();
  const { routineId } = useParams();
  const { activeProfile } = useActiveProfile();
  const { routine, isLoading: routineLoading } = useRoutine(routineId);
  const { exercises, isLoading: exercisesLoading } = useExercises(routineId);
  const { activeSession, discardActiveSession, isLoading: sessionLoading } =
    useActiveWorkoutSession(activeProfile?.id);
  const {
    session,
    setLogs,
    timedLogs,
    isLoading: logsLoading,
    updateSetLog,
    updateTimedLog,
    startTimedLog,
    pauseTimedLog,
    resetTimedLog,
    finishSession
  } = useWorkoutSession(activeSession?.id);

  if (routineLoading || exercisesLoading || sessionLoading || logsLoading) {
    return <p className="text-neutral-700">Cargando...</p>;
  }

  if (!routine || !activeProfile) {
    return <Navigate replace to="/rutinas" />;
  }

  if (!activeSession || !session || activeSession.routine_id !== routine.id) {
    return <Navigate replace to={`/rutinas/${routine.id}`} />;
  }

  const currentRoutine = routine;
  const currentSession = session;

  async function handleDiscard() {
    const confirmed = window.confirm(
      "Esto va a descartar la rutina en curso. No se puede deshacer."
    );

    if (!confirmed) {
      return;
    }

    await discardActiveSession(currentSession.id);
    void navigate(`/rutinas/${currentRoutine.id}`);
  }

  async function handleFinish() {
    await finishSession();
    void navigate(`/rutinas/${currentRoutine.id}`);
  }

  return (
    <section className="flex flex-1 flex-col gap-6">
      <header className="grid gap-2">
        <button
          className="self-start text-sm font-semibold text-neutral-700"
          onClick={() => void navigate(`/rutinas/${currentRoutine.id}`)}
          type="button"
        >
          Volver
        </button>
        <p className="text-sm font-medium uppercase tracking-wide text-neutral-500">
          Rutina en curso
        </p>
        <h1 className="text-3xl font-semibold">{currentRoutine.title}</h1>
        <p className="text-sm text-neutral-700">
          Inicio: {new Date(currentSession.started_at).toLocaleString("es-AR")}
        </p>
      </header>

      <ActiveWorkout
        exercises={exercises}
        onPauseTimedLog={pauseTimedLog}
        onResetTimedLog={resetTimedLog}
        onStartTimedLog={startTimedLog}
        onUpdateSetLog={updateSetLog}
        onUpdateTimedLog={updateTimedLog}
        setLogs={setLogs}
        timedLogs={timedLogs}
      />

      <FinishWorkoutButton onFinish={handleFinish} />

      <Button onClick={() => void handleDiscard()} variant="secondary">
        Descartar rutina
      </Button>
    </section>
  );
}
