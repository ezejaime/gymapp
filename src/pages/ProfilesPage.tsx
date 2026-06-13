import { useNavigate } from "react-router";
import { ProfileSelector } from "../components/profiles/ProfileSelector";
import { useActiveProfile } from "../hooks/useActiveProfile";
import { useProfiles } from "../hooks/useProfiles";
import type { Profile } from "../types";

export function ProfilesPage() {
  const navigate = useNavigate();
  const { chooseProfile } = useActiveProfile();
  const { addProfile, error, isLoading, profiles } = useProfiles();

  async function handleSelectProfile(profile: Profile) {
    await chooseProfile(profile.id);
    void navigate("/rutinas");
  }

  return (
    <section className="flex flex-1 flex-col gap-6">
      <header className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-wide text-neutral-500">
          Rutinas
        </p>
        <h1 className="text-3xl font-semibold">Elegí un perfil</h1>
      </header>

      <ProfileSelector
        error={error}
        isLoading={isLoading}
        onCreate={addProfile}
        onSelect={handleSelectProfile}
        profiles={profiles}
      />
    </section>
  );
}
