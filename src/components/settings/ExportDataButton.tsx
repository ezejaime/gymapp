import { Button } from "../ui/Button";

type ExportDataButtonProps = {
  disabled?: boolean;
  onExport: () => void;
};

export function ExportDataButton({ disabled, onExport }: ExportDataButtonProps) {
  return (
    <Button disabled={disabled} onClick={onExport}>
      Descargar backup
    </Button>
  );
}
