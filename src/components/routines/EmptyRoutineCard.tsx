import { useNavigate } from "react-router";

export function EmptyRoutineCard() {
  const navigate = useNavigate();

  return (
    <button
      className="flex aspect-[5/4] w-full flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-neutral-300 bg-white p-6 text-center transition hover:bg-neutral-50"
      onClick={() => void navigate("/rutinas/nueva")}
      type="button"
    >
      <span className="text-5xl leading-none">+</span>
      <span className="text-lg font-semibold">Nueva rutina</span>
      <span className="text-sm text-neutral-600">
        Creá una rutina para este perfil.
      </span>
    </button>
  );
}
