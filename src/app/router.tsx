import { createBrowserRouter, Navigate, Outlet } from "react-router";
import { useActiveProfile } from "../hooks/useActiveProfile";
import { ActiveRoutinePage } from "../pages/ActiveRoutinePage";
import { ExerciseDetailPage } from "../pages/ExerciseDetailPage";
import { ExerciseEditPage } from "../pages/ExerciseEditPage";
import { ExerciseHistoryPage } from "../pages/ExerciseHistoryPage";
import { NewExercisePage } from "../pages/NewExercisePage";
import { NewRoutinePage } from "../pages/NewRoutinePage";
import { ProfilesPage } from "../pages/ProfilesPage";
import { RoutineDetailPage } from "../pages/RoutineDetailPage";
import { RoutineEditPage } from "../pages/RoutineEditPage";
import { RoutinesPage } from "../pages/RoutinesPage";
import { SettingsPage } from "../pages/SettingsPage";

function RootLayout() {
  return (
    <main className="min-h-screen bg-white text-black">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-[calc(1.5rem+env(safe-area-inset-top))]">
        <Outlet />
      </div>
    </main>
  );
}

function IndexRedirect() {
  const { activeProfile, isLoading } = useActiveProfile();

  if (isLoading) {
    return <p className="text-neutral-700">Cargando...</p>;
  }

  return <Navigate replace to={activeProfile ? "/rutinas" : "/perfiles"} />;
}

function RequireActiveProfile() {
  const { activeProfile, isLoading } = useActiveProfile();

  if (isLoading) {
    return <p className="text-neutral-700">Cargando...</p>;
  }

  if (!activeProfile) {
    return <Navigate replace to="/perfiles" />;
  }

  return <Outlet />;
}

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: "/",
        element: <IndexRedirect />
      },
      {
        path: "/perfiles",
        element: <ProfilesPage />
      },
      {
        element: <RequireActiveProfile />,
        children: [
          {
            path: "/rutinas",
            element: <RoutinesPage />
          },
          {
            path: "/ajustes",
            element: <SettingsPage />
          },
          {
            path: "/rutinas/nueva",
            element: <NewRoutinePage />
          },
          {
            path: "/rutinas/:routineId",
            element: <RoutineDetailPage />
          },
          {
            path: "/rutinas/:routineId/editar",
            element: <RoutineEditPage />
          },
          {
            path: "/rutinas/:routineId/sesion",
            element: <ActiveRoutinePage />
          },
          {
            path: "/rutinas/:routineId/ejercicios/nuevo",
            element: <NewExercisePage />
          },
          {
            path: "/ejercicios/:exerciseId",
            element: <ExerciseDetailPage />
          },
          {
            path: "/ejercicios/:exerciseId/editar",
            element: <ExerciseEditPage />
          },
          {
            path: "/ejercicios/:exerciseId/historico",
            element: <ExerciseHistoryPage />
          }
        ]
      }
    ]
  }
]);
