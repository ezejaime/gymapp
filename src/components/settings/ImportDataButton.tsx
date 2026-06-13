import { useRef } from "react";
import { Button } from "../ui/Button";

type ImportDataButtonProps = {
  disabled?: boolean;
  onImport: (file: File) => void;
};

export function ImportDataButton({ disabled, onImport }: ImportDataButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    onImport(file);
  }

  return (
    <>
      <input
        ref={inputRef}
        accept="application/json,.json"
        className="hidden"
        onChange={handleChange}
        type="file"
      />
      <Button
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        variant="secondary"
      >
        Subir backup
      </Button>
    </>
  );
}
