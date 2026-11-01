import type { CameraActivityPoint } from "@/backend";
import { ChartCard } from "@/components/analytics/ChartCard";
import { ChartTooltip } from "@/components/analytics/ChartTooltip";
import { formatCount } from "@/lib/roadwatch";
import { Cctv } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

/** Detections and incidents per camera, side by side. */
export function CameraActivityChart({
  data,
}: {
  data: CameraActivityPoint[];
}) {
  const rows = data.map((point) => ({
    camera: point.cameraCode,
    detections: Number(point.detections),
    incidents: Number(point.incidents),
  }));

  return (
    <ChartCard
      title="Camera activity"
      description="Detections and incidents recorded per camera"
      icon={Cctv}
      badge={
        <span className="rounded-full bg-secondary px-2.5 py-1 font-mono-num text-xs font-medium text-muted-foreground">
          {formatCount(rows.length)} cameras
        </span>
      }
    >
      <div className="h-64 w-full" data-ocid="analytics.chart.camera_activity">
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
              dataKey="camera"
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
              content={<ChartTooltip />}
              cursor={{ fill: "var(--secondary)", opacity: 0.4 }}
            />
            <Legend
              wrapperStyle={{ fontSize: 12, color: "var(--muted-foreground)" }}
              iconType="circle"
            />
            <Bar
              dataKey="detections"
              name="Detections"
              fill="var(--chart-2)"
              radius={[4, 4, 0, 0]}
              maxBarSize={32}
            />
            <Bar
              dataKey="incidents"
              name="Incidents"
              fill="var(--chart-4)"
              radius={[4, 4, 0, 0]}
              maxBarSize={32}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
