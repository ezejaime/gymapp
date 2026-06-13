import { Button } from "../ui/Button";

type ClearDataButtonProps = {
  disabled?: boolean;
  onClear: () => void;
};

export function ClearDataButton({ disabled, onClear }: ClearDataButtonProps) {
  return (
    <Button disabled={disabled} onClick={onClear} variant="secondary">
      Limpiar datos locales
    </Button>
  );
}
