import type { DetectionStatPoint } from "@/backend";
import type { VehicleClass } from "@/backend";
import { ChartCard } from "@/components/analytics/ChartCard";
import { ChartTooltip } from "@/components/analytics/ChartTooltip";
import { formatCount, vehicleClassLabel } from "@/lib/roadwatch";
import { ScanLine } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const CLASS_COLORS: Record<string, string> = {
  Car: "var(--chart-1)",
  Motorcycle: "var(--chart-2)",
  Bus: "var(--chart-3)",
  Truck: "var(--chart-5)",
};

/** Detection statistics broken down by vehicle class. */
export function DetectionStatsChart({
  data,
  className,
}: {
  data: DetectionStatPoint[];
  className?: string;
}) {
  const rows = data.map((point) => ({
    vehicleClass: vehicleClassLabel(point.vehicleClass as VehicleClass),
    count: Number(point.count),
  }));
  const total = rows.reduce((sum, row) => sum + row.count, 0);

  return (
    <ChartCard
      title="Detection statistics by vehicle class"
      description="Total detections grouped by classified vehicle type"
      icon={ScanLine}
      className={className}
      badge={
        <span className="rounded-full bg-secondary px-2.5 py-1 font-mono-num text-xs font-medium text-accent">
          {formatCount(total)} detections
        </span>
      }
    >
      <div className="h-64 w-full" data-ocid="analytics.chart.detection_stats">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={rows}
            layout="vertical"
            margin={{ top: 8, right: 20, left: 8, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
              horizontal={false}
            />
            <XAxis
              type="number"
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "var(--border)" }}
              allowDecimals={false}
            />
            <YAxis
              type="category"
              dataKey="vehicleClass"
              tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              width={92}
            />
            <Tooltip
              content={<ChartTooltip valueLabel="Detections" />}
              cursor={{ fill: "var(--secondary)", opacity: 0.4 }}
            />
            <Bar
              dataKey="count"
              name="Detections"
              radius={[0, 4, 4, 0]}
              maxBarSize={28}
            >
              {rows.map((row) => (
                <Cell
                  key={row.vehicleClass}
                  fill={CLASS_COLORS[row.vehicleClass] ?? "var(--chart-1)"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
