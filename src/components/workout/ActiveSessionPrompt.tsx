import { useNavigate } from "react-router";
import type { WorkoutSession } from "../../types";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

type ActiveSessionPromptProps = {
  session: WorkoutSession;
  onDiscard: (sessionId: string) => Promise<void>;
};

export function ActiveSessionPrompt({ session, onDiscard }: ActiveSessionPromptProps) {
  const navigate = useNavigate();

  async function handleDiscard() {
    const confirmed = window.confirm(
      "Esto va a descartar la rutina en curso. No se puede deshacer."
    );

    if (!confirmed) {
      return;
    }

    await onDiscard(session.id);
  }

  return (
    <Card className="grid gap-4">
      <div className="grid gap-1">
        <h2 className="text-xl font-semibold">Tenés una rutina en curso</h2>
        <p className="text-sm text-neutral-700">
          Empezó el {new Date(session.started_at).toLocaleString("es-AR")}.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button
          onClick={() => void navigate(`/rutinas/${session.routine_id}/sesion`)}
        >
          Retomar
        </Button>
        <Button onClick={() => void handleDiscard()} variant="secondary">
          Descartar
        </Button>
      </div>
    </Card>
  );
}
