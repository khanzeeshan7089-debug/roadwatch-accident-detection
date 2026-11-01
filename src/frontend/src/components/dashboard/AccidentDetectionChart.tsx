import type { DetectionStatPoint } from "@/backend";
import type { VehicleClass } from "@/backend";
import { ChartCard } from "@/components/dashboard/ChartCard";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { formatCount, vehicleClassLabel } from "@/lib/roadwatch";
import { ShieldAlert } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";

const chartConfig = {
  count: { label: "Detections", color: "var(--chart-2)" },
} satisfies ChartConfig;

const CLASS_COLORS: Record<string, string> = {
  car: "var(--chart-1)",
  motorcycle: "var(--chart-2)",
  bus: "var(--chart-3)",
  truck: "var(--chart-5)",
};

export function AccidentDetectionChart({
  data,
}: {
  data: DetectionStatPoint[];
}) {
  const points = data.map((point) => ({
    vehicleClass: point.vehicleClass,
    label: vehicleClassLabel(point.vehicleClass as VehicleClass),
    count: Number(point.count),
  }));

  return (
    <ChartCard
      title="Accident Detection Statistics"
      description="Detections by vehicle class feeding the accident pipeline"
      icon={ShieldAlert}
      ocid="dashboard.accident_chart.panel"
    >
      <ChartContainer
        config={chartConfig}
        data-ocid="dashboard.accident_chart.chart"
        className="h-[16rem] w-full"
      >
        <BarChart data={points} margin={{ left: 4, right: 8, top: 8 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={40}
            tickFormatter={(value: number) => formatCount(value)}
          />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent indicator="dot" />}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {points.map((point) => (
              <Cell
                key={point.vehicleClass}
                fill={CLASS_COLORS[point.vehicleClass] ?? "var(--chart-1)"}
              />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
    </ChartCard>
  );
}
