import type { WeeklyAlertPoint } from "@/backend";
import { ChartCard } from "@/components/analytics/ChartCard";
import { ChartTooltip } from "@/components/analytics/ChartTooltip";
import { formatCount } from "@/lib/roadwatch";
import { Siren } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

/** Weekly accident alert volume. */
export function WeeklyAlertsChart({ data }: { data: WeeklyAlertPoint[] }) {
  const rows = data.map((point) => ({
    week: point.week,
    count: Number(point.count),
  }));
  const total = rows.reduce((sum, row) => sum + row.count, 0);

  return (
    <ChartCard
      title="Weekly accident alerts"
      description="Emergency alerts raised per week"
      icon={Siren}
      badge={
        <span className="rounded-full bg-destructive/15 px-2.5 py-1 font-mono-num text-xs font-medium text-destructive">
          {formatCount(total)} alerts
        </span>
      }
    >
      <div className="h-64 w-full" data-ocid="analytics.chart.weekly_alerts">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={rows}
            margin={{ top: 8, right: 12, left: -12, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
              vertical={false}
            />
            <XAxis
              dataKey="week"
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "var(--border)" }}
            />
            <YAxis
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={44}
              allowDecimals={false}
            />
            <Tooltip
              content={<ChartTooltip valueLabel="Alerts" />}
              cursor={{ fill: "var(--secondary)", opacity: 0.4 }}
            />
            <Bar
              dataKey="count"
              name="Alerts"
              fill="var(--chart-4)"
              radius={[4, 4, 0, 0]}
              maxBarSize={48}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
