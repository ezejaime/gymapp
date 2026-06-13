import { Button } from "../ui/Button";

type FinishWorkoutButtonProps = {
  onFinish: () => Promise<void>;
};

export function FinishWorkoutButton({ onFinish }: FinishWorkoutButtonProps) {
  async function handleFinish() {
    const confirmed = window.confirm("¿Finalizar rutina?");

    if (!confirmed) {
      return;
    }

    await onFinish();
  }

  return (
    <Button onClick={() => void handleFinish()}>
      Finalizar rutina
    </Button>
  );
}
