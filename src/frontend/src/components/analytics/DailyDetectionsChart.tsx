import type { DailyDetectionPoint } from "@/backend";
import { ChartCard } from "@/components/analytics/ChartCard";
import { ChartTooltip } from "@/components/analytics/ChartTooltip";
import { formatCount } from "@/lib/roadwatch";
import { Car } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

/** Daily vehicle detections over the recent window. */
export function DailyDetectionsChart({
  data,
}: {
  data: DailyDetectionPoint[];
}) {
  const rows = data.map((point) => ({
    date: point.date,
    count: Number(point.count),
  }));
  const total = rows.reduce((sum, row) => sum + row.count, 0);

  return (
    <ChartCard
      title="Daily vehicle detections"
      description="Vehicles detected per day across all cameras"
      icon={Car}
      badge={
        <span className="rounded-full bg-secondary px-2.5 py-1 font-mono-num text-xs font-medium text-accent">
          {formatCount(total)} total
        </span>
      }
    >
      <div className="h-64 w-full" data-ocid="analytics.chart.daily_detections">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={rows}
            margin={{ top: 8, right: 12, left: -12, bottom: 0 }}
          >
            <defs>
              <linearGradient
                id="dailyDetectionsFill"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="var(--chart-1)"
                  stopOpacity={0.5}
                />
                <stop
                  offset="100%"
                  stopColor="var(--chart-1)"
                  stopOpacity={0.02}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "var(--border)" }}
              minTickGap={16}
            />
            <YAxis
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={44}
              allowDecimals={false}
            />
            <Tooltip
              content={<ChartTooltip valueLabel="Detections" />}
              cursor={{ stroke: "var(--accent)", strokeDasharray: "3 3" }}
            />
            <Area
              type="monotone"
              dataKey="count"
              name="Detections"
              stroke="var(--chart-1)"
              strokeWidth={2}
              fill="url(#dailyDetectionsFill)"
              activeDot={{ r: 4, fill: "var(--accent)" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
