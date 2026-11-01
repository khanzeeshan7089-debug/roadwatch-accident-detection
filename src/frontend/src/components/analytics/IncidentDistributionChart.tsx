import type { IncidentDistributionPoint } from "@/backend";
import { ChartCard } from "@/components/analytics/ChartCard";
import { ChartTooltip } from "@/components/analytics/ChartTooltip";
import { formatCount } from "@/lib/roadwatch";
import { PieChart as PieChartIcon } from "lucide-react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const STATUS_COLORS: Record<string, string> = {
  Potential: "var(--chart-5)",
  Verified: "var(--chart-4)",
  "False alarm": "var(--chart-3)",
  Resolved: "var(--chart-1)",
};

const FALLBACK_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

/** Incident distribution by status. */
export function IncidentDistributionChart({
  data,
}: {
  data: IncidentDistributionPoint[];
}) {
  const rows = data
    .map((point) => ({ status: point.status, count: Number(point.count) }))
    .filter((row) => row.count > 0);
  const total = rows.reduce((sum, row) => sum + row.count, 0);

  return (
    <ChartCard
      title="Incident distribution"
      description="Incidents grouped by current status"
      icon={PieChartIcon}
      badge={
        <span className="rounded-full bg-secondary px-2.5 py-1 font-mono-num text-xs font-medium text-accent">
          {formatCount(total)} incidents
        </span>
      }
    >
      <div
        className="h-64 w-full"
        data-ocid="analytics.chart.incident_distribution"
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<ChartTooltip valueLabel="Incidents" />} />
            <Legend
              wrapperStyle={{ fontSize: 12, color: "var(--muted-foreground)" }}
              iconType="circle"
            />
            <Pie
              data={rows}
              dataKey="count"
              nameKey="status"
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={82}
              paddingAngle={2}
              stroke="var(--card)"
              strokeWidth={2}
            >
              {rows.map((row, index) => (
                <Cell
                  key={row.status}
                  fill={
                    STATUS_COLORS[row.status] ??
                    FALLBACK_COLORS[index % FALLBACK_COLORS.length]
                  }
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
