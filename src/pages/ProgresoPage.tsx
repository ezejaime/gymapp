import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/Button";
import { useActiveProfile } from "../hooks/useActiveProfile";
import { useProgreso } from "../hooks/useProgreso";
import type { DayData } from "../hooks/useProgreso";

const GOAL_KEY_PREFIX = "weeklyGoal_";

const DAY_LABELS = ["D", "L", "M", "M", "J", "V", "S"];
const MONTH_LABELS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre"
];

function getDotColor(percent: number): string {
  if (percent >= 100) return "bg-green-500";
  if (percent >= 50) return "bg-yellow-400";
  return "bg-orange-400";
}

function CalendarGrid({
  year,
  month,
  daysByDate,
  onDayClick
}: {
  year: number;
  month: number;
  daysByDate: Map<string, DayData>;
  onDayClick: (dateKey: string, data: DayData) => void;
}) {
  const cells = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPad = firstDay.getDay();
    const totalDays = lastDay.getDate();
    const cells: React.ReactNode[] = [];

    for (let i = 0; i < startPad; i++) {
      cells.push(<div key={`pad-start-${i}`} />);
    }

    for (let day = 1; day <= totalDays; day++) {
      const dateObj = new Date(year, month, day);
      const dateKey = dateObj.toISOString().slice(0, 10);
      const dayData = daysByDate.get(dateKey);
      const isToday =
        new Date().toISOString().slice(0, 10) === dateKey;

      cells.push(
        <button
          key={dateKey}
          className={`relative flex aspect-square items-center justify-center rounded-full text-sm transition-colors ${
            isToday
              ? "font-bold ring-2 ring-black ring-offset-1"
              : "hover:bg-neutral-100"
          } ${dayData ? "text-white" : "text-neutral-700"}`}
          onClick={() => {
            if (dayData) onDayClick(dateKey, dayData);
          }}
          type="button"
        >
          {dayData ? (
            <span
              className={`flex size-8 items-center justify-center rounded-full ${getDotColor(dayData.completion.percent)}`}
            >
              {day}
            </span>
          ) : (
            <span className="flex size-8 items-center justify-center">
              {day}
            </span>
          )}
        </button>
      );
    }

    return cells;
  }, [year, month, daysByDate, onDayClick]);

  return (
    <div className="grid grid-cols-7 gap-1">
      {DAY_LABELS.map((label) => (
        <div
          key={label}
          className="pb-1 text-center text-xs font-medium text-neutral-500"
        >
          {label}
        </div>
      ))}
      {cells}
    </div>
  );
}

export function ProgresoPage() {
  const navigate = useNavigate();
  const { activeProfile } = useActiveProfile();
  const { daysByDate, isLoading, error } = useProgreso(activeProfile?.id);
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<{
    dateKey: string;
    data: DayData;
  } | null>(null);
  const [weeklyGoal, setWeeklyGoal] = useState(() => {
    if (!activeProfile?.id) return 3;
    const stored = localStorage.getItem(GOAL_KEY_PREFIX + activeProfile.id);
    return stored ? Number(stored) : 3;
  });

  function updateGoal(newGoal: number) {
    if (!activeProfile?.id || newGoal < 1 || newGoal > 7) return;
    setWeeklyGoal(newGoal);
    localStorage.setItem(GOAL_KEY_PREFIX + activeProfile.id, String(newGoal));
  }

  const weeklyBreakdown = useMemo(() => {
    if (daysByDate.size === 0) return [];

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const start = new Date(firstDay);
    start.setDate(start.getDate() - start.getDay());
    const end = new Date(lastDay);
    end.setDate(end.getDate() + (6 - end.getDay()));
    const weeks: { label: string; trained: number; goal: number }[] = [];
    let weekStart = new Date(start);
    let weekCounter = 0;

    while (weekStart <= end) {
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      if (weekStart > lastDay || weekEnd < firstDay) {
        weekStart.setDate(weekStart.getDate() + 7);
        continue;
      }

      weekCounter++;
      let trained = 0;
      const cur = new Date(weekStart);
      while (cur <= weekEnd && cur <= end) {
        if (
          cur.getMonth() === month &&
          daysByDate.has(cur.toISOString().slice(0, 10))
        ) {
          trained++;
        }
        cur.setDate(cur.getDate() + 1);
      }

      weeks.push({
        label: `Sem ${weekCounter}`,
        trained,
        goal: weeklyGoal
      });
      weekStart.setDate(weekStart.getDate() + 7);
    }

    return weeks;
  }, [year, month, daysByDate, weeklyGoal]);

  function prevMonth() {
    if (month === 0) {
      setYear((y) => y - 1);
      setMonth(11);
    } else {
      setMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (month === 11) {
      setYear((y) => y + 1);
      setMonth(0);
    } else {
      setMonth((m) => m + 1);
    }
  }

  return (
    <section className="flex flex-1 flex-col gap-6">
      <header className="flex items-center justify-between">
        <button
          className="self-start text-sm font-semibold text-neutral-700"
          onClick={() => void navigate("/rutinas")}
          type="button"
        >
          Volver
        </button>
        <h1 className="text-xl font-semibold">Progreso</h1>
        <div className="w-14" />
      </header>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-xs text-neutral-600">
        <span className="flex items-center gap-1">
          <span className="inline-block size-3 rounded-full bg-orange-400" />{" "}
          &lt;50%
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block size-3 rounded-full bg-yellow-400" />{" "}
          &ge;50%
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block size-3 rounded-full bg-green-500" /> 100%
        </span>
      </div>

      {/* Weekly goal */}
      <div className="flex items-center justify-center gap-3 rounded-lg border border-neutral-200 p-3">
        <span className="text-sm text-neutral-600">Objetivo semanal:</span>
        <button
          aria-label="Reducir objetivo"
          className="flex size-8 items-center justify-center rounded-full border border-neutral-300 text-lg font-semibold hover:bg-neutral-100 disabled:opacity-30"
          disabled={weeklyGoal <= 1}
          onClick={() => updateGoal(weeklyGoal - 1)}
          type="button"
        >
          −
        </button>
        <span className="min-w-8 text-center text-lg font-bold">
          {weeklyGoal}
        </span>
        <button
          aria-label="Aumentar objetivo"
          className="flex size-8 items-center justify-center rounded-full border border-neutral-300 text-lg font-semibold hover:bg-neutral-100 disabled:opacity-30"
          disabled={weeklyGoal >= 7}
          onClick={() => updateGoal(weeklyGoal + 1)}
          type="button"
        >
          +
        </button>
        <span className="text-sm text-neutral-500">días / semana</span>
      </div>

      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <button
          className="rounded-full p-2 text-lg hover:bg-neutral-100"
          onClick={prevMonth}
          type="button"
          aria-label="Mes anterior"
        >
          ←
        </button>
        <h2 className="text-lg font-semibold">
          {MONTH_LABELS[month]} {year}
        </h2>
        <button
          className="rounded-full p-2 text-lg hover:bg-neutral-100"
          onClick={nextMonth}
          type="button"
          aria-label="Mes siguiente"
        >
          →
        </button>
      </div>

      {/* Calendar */}
      {isLoading ? (
        <p className="text-center text-neutral-700">Cargando progreso...</p>
      ) : error ? (
        <p className="text-center text-neutral-700">{error}</p>
      ) : (
        <CalendarGrid
          daysByDate={daysByDate}
          month={month}
          onDayClick={(dateKey, data) => setSelectedDay({ dateKey, data })}
          year={year}
        />
      )}

      {/* Weekly breakdown */}
      {weeklyBreakdown.length > 0 && (
        <div className="rounded-lg border border-neutral-200 p-4">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-600">
            Progreso mensual
          </h3>
          <div className="grid gap-2">
            {weeklyBreakdown.map((week) => {
              const met = week.trained >= week.goal;
              return (
                <div
                  className="flex items-center justify-between gap-3"
                  key={week.label}
                >
                  <span className="w-12 text-xs font-medium text-neutral-500">
                    {week.label}
                  </span>
                  <div className="flex flex-1 gap-1">
                    {Array.from({ length: Math.max(week.goal, week.trained, 7) }).map(
                      (_, i) => (
                        <span
                          key={i}
                          className={`flex h-4 flex-1 rounded-sm ${
                            i < week.trained ? "bg-green-500" : "bg-neutral-200"
                          }`}
                        />
                      )
                    )}
                  </div>
                  <span className="min-w-fit text-right text-xs font-medium text-neutral-600">
                    {week.trained}/{week.goal}{" "}
                    {met ? (
                      <svg aria-hidden="true" className="inline size-4 text-green-600" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      <svg aria-hidden="true" className="inline size-4 text-neutral-400" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom modal */}
      {selectedDay ? (
        <div className="fixed inset-x-0 bottom-0 z-50 animate-slide-up">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/20"
            onClick={() => setSelectedDay(null)}
          />

          {/* Banner */}
          <div className="relative mx-auto max-w-md rounded-t-2xl bg-white px-6 pb-8 pt-6 shadow-xl">
            <button
              className="absolute right-4 top-4 rounded-full p-1 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800"
              onClick={() => setSelectedDay(null)}
              type="button"
              aria-label="Cerrar"
            >
              <svg
                aria-hidden="true"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  d="M6 18L18 6M6 6l12 12"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-neutral-500">
              {new Date(selectedDay.dateKey).toLocaleDateString("es-AR", {
                day: "numeric",
                month: "long",
                year: "numeric"
              })}
            </p>

            <h3 className="mb-1 text-xl font-semibold">
              {selectedDay.data.routine.title}
            </h3>

            {selectedDay.data.routine.description && (
              <p className="text-sm text-neutral-600 line-clamp-3">
                {selectedDay.data.routine.description}
              </p>
            )}

            <div className="mt-3 flex items-center gap-2">
              <span
                className={`inline-block size-3 rounded-full ${getDotColor(selectedDay.data.completion.percent)}`}
              />
              <span className="text-sm text-neutral-600">
                {selectedDay.data.completion.completed} de{" "}
                {selectedDay.data.completion.total} ejercicios completados (
                {selectedDay.data.completion.percent}%)
              </span>
            </div>

            <Button
              className="mt-4 w-full"
              onClick={() => setSelectedDay(null)}
            >
              Cerrar
            </Button>
          </div>
        </div>
      ) : null}

      {/* Slide-up animation */}
      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.25s ease-out;
        }
      `}</style>
    </section>
  );
}
