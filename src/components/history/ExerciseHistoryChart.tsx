import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import type { ExerciseHistoryPoint } from "../../db/workoutRepository";

type ExerciseHistoryChartProps = {
  data: ExerciseHistoryPoint[];
};

function formatDateLabel(date: string) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit"
  }).format(new Date(date));
}

export function ExerciseHistoryChart({ data }: ExerciseHistoryChartProps) {
  const chartData = data.map((point) => ({
    ...point,
    label: formatDateLabel(point.date)
  }));

  return (
    <div className="h-64 w-full rounded-lg border border-neutral-200 p-3">
      <ResponsiveContainer height="100%" width="100%">
        <LineChart data={chartData} margin={{ bottom: 8, left: 0, right: 8, top: 8 }}>
          <CartesianGrid stroke="#e5e5e5" strokeDasharray="3 3" />
          <XAxis dataKey="label" stroke="#525252" />
          <YAxis
            stroke="#525252"
            tickFormatter={(value) => `${value} kg`}
            width={48}
          />
          <Tooltip
            formatter={(value) => [`${value} kg`, "Peso"]}
            labelFormatter={(label) => `Fecha ${label}`}
          />
          <Line
            dataKey="weight"
            dot
            stroke="#000"
            strokeWidth={2}
            type="monotone"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
