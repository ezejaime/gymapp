import type { Profile } from "../../types";
import { Card } from "../ui/Card";
import { CreateProfileForm } from "./CreateProfileForm";
import { ProfileCard } from "./ProfileCard";

type ProfileSelectorProps = {
  profiles: Profile[];
  isLoading: boolean;
  error?: string;
  onCreate: (name: string) => Promise<Profile>;
  onSelect: (profile: Profile) => void;
};

export function ProfileSelector({
  profiles,
  isLoading,
  error,
  onCreate,
  onSelect
}: ProfileSelectorProps) {
  return (
    <div className="grid gap-4">
      {isLoading ? <p className="text-neutral-700">Cargando perfiles...</p> : null}
      {error ? <p className="text-neutral-700">{error}</p> : null}

      {!isLoading && profiles.length > 0 ? (
        <div className="grid gap-3">
          {profiles.map((profile) => (
            <ProfileCard key={profile.id} onSelect={onSelect} profile={profile} />
          ))}
        </div>
      ) : null}

      {!isLoading && profiles.length === 0 ? (
        <Card>
          <p className="text-neutral-700">No tenés perfiles todavía.</p>
        </Card>
      ) : null}

      <Card className="grid gap-4">
        <h2 className="text-lg font-semibold">Crear perfil</h2>
        <CreateProfileForm onCreate={onCreate} onCreated={onSelect} />
      </Card>
    </div>
  );
}
