import { type FormEvent, useState } from "react";
import type { Profile } from "../../types";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

type CreateProfileFormProps = {
  onCreate: (name: string) => Promise<Profile>;
  onCreated: (profile: Profile) => void;
};

export function CreateProfileForm({ onCreate, onCreated }: CreateProfileFormProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Escribí un nombre para el perfil.");
      return;
    }

    setIsSubmitting(true);
    setError(undefined);

    try {
      const profile = await onCreate(trimmedName);
      setName("");
      onCreated(profile);
    } catch {
      setError("No pudimos crear el perfil.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="grid gap-3" onSubmit={handleSubmit}>
      <Input
        autoComplete="off"
        label="Nombre"
        name="profileName"
        onChange={(event) => setName(event.target.value)}
        placeholder="Ej: Eze"
        value={name}
      />

      {error ? <p className="text-sm text-neutral-700">{error}</p> : null}

      <Button disabled={isSubmitting} type="submit">
        {isSubmitting ? "Creando..." : "Crear perfil"}
      </Button>
    </form>
  );
}
