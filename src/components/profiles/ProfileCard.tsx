import type { Profile } from "../../types";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

type ProfileCardProps = {
  profile: Profile;
  onSelect: (profile: Profile) => void;
};

export function ProfileCard({ profile, onSelect }: ProfileCardProps) {
  return (
    <Card className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="truncate text-lg font-semibold">{profile.name}</p>
      </div>
      <Button onClick={() => onSelect(profile)} variant="secondary">
        Usar
      </Button>
    </Card>
  );
}
