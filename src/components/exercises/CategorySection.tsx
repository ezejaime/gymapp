import { useExerciseConfigs } from "../../hooks/useExerciseConfigs";
import type { Exercise, ExerciseCategory } from "../../types";
import { exerciseCategoryLabels } from "../../utils/exerciseLabels";
import { ExerciseRowCard } from "./ExerciseRowCard";

type CategorySectionProps = {
  category: ExerciseCategory;
  exercises: Exercise[];
  allExercises: Exercise[];
  onDelete: (exercise: Exercise) => void;
  onMove: (exerciseId: string, direction: "up" | "down") => void;
};

export function CategorySection({
  category,
  exercises,
  allExercises,
  onDelete,
  onMove
}: CategorySectionProps) {
  const configs = useExerciseConfigs(exercises);

  if (exercises.length === 0) {
    return null;
  }

  return (
    <section className="grid gap-3">
      <h2 className="text-xl font-semibold">{exerciseCategoryLabels[category]}</h2>
      <div className="grid gap-3">
        {exercises.map((exercise) => {
          const globalIndex = allExercises.findIndex(
            (item) => item.id === exercise.id
          );

          return (
            <ExerciseRowCard
              canMoveDown={globalIndex < allExercises.length - 1}
              canMoveUp={globalIndex > 0}
              exercise={exercise}
              key={exercise.id}
              onDelete={onDelete}
              onMove={onMove}
              setsConfig={configs[exercise.id]?.setsConfig}
              timedConfig={configs[exercise.id]?.timedConfig}
            />
          );
        })}
      </div>
    </section>
  );
}
