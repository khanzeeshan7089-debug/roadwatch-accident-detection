import type { DailyDetectionPoint } from "@/backend";
import { ChartCard } from "@/components/dashboard/ChartCard";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { formatCount } from "@/lib/roadwatch";
import { TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

const chartConfig = {
  count: { label: "Vehicles detected", color: "var(--chart-1)" },
} satisfies ChartConfig;

export function TrafficAnalyticsChart({
  data,
}: {
  data: DailyDetectionPoint[];
}) {
  const points = data.map((point) => ({
    date: point.date,
    count: Number(point.count),
  }));

  return (
    <ChartCard
      title="Traffic Analytics"
      description="Daily vehicle detections across the monitored network"
      icon={TrendingUp}
      ocid="dashboard.traffic_chart.panel"
    >
      <ChartContainer
        config={chartConfig}
        data-ocid="dashboard.traffic_chart.chart"
        className="h-[16rem] w-full"
      >
        <AreaChart data={points} margin={{ left: 4, right: 8, top: 8 }}>
          <defs>
            <linearGradient id="fillDetections" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--color-count)"
                stopOpacity={0.5}
              />
              <stop
                offset="95%"
                stopColor="var(--color-count)"
                stopOpacity={0.05}
              />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={24}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={40}
            tickFormatter={(value: number) => formatCount(value)}
          />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent indicator="line" />}
          />
          <Area
            dataKey="count"
            type="monotone"
            stroke="var(--color-count)"
            strokeWidth={2}
            fill="url(#fillDetections)"
          />
        </AreaChart>
      </ChartContainer>
    </ChartCard>
  );
}
